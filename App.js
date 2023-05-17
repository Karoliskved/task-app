import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Platform,
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Animated,
  Dimensions,
  NativeModules,
  AppState,
  PermissionsAndroid,
} from "react-native";
import {
  Button,
  Card,
  SearchBar,
  lightColors,
  createTheme,
  ThemeProvider,
  darkColors,
  Icon,
  FAB,
  Overlay,
  Input,
} from "@rneui/themed";
import DateTimePicker from "@react-native-community/datetimepicker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import uuid from "react-native-uuid";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Picker } from "@react-native-picker/picker";

const theme = createTheme({
  lightColors: {
    ...Platform.select({
      default: lightColors.platform.android,
      ios: lightColors.platform.ios,
    }),
  },
  darkColors: {
    ...Platform.select({
      default: darkColors.platform.android,
      ios: darkColors.platform.ios,
    }),
  },
});
// save notes to local storage
const saveNotes = async (key, value) => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
    console.log("Notes saved successfully");
  } catch (error) {
    console.log("Error saving notes:", error);
  }
};
// retrieve notes from local storage
const getNotes = async (key) => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    if (jsonValue !== null) {
      const notes = JSON.parse(jsonValue);
      console.log("Notes retrieved successfully:", notes);
      return notes;
    } else {
      console.log("Notes not found");
      const notes = [];
      return notes;
    }
  } catch (error) {
    console.log("Error retrieving notes:", error);
  }
};
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const App = () => {
  const [locale, setLocale] = useState(undefined);
  const [notes, setNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([...notes]);
  const [visibleAddNote, setVisibleAddNote] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [slideAnim] = useState(new Animated.Value(400));
  const { width } = Dimensions.get("window");
  const [noteToEdit, setNoteToEdit] = useState({
    id: 0,
    content: "",
    title: "",
    priority: "",
    dateCreated: new Date(),
    deadlineDate: new Date(),
  });
  const [searchValue, setSearchValue] = useState("");
  const [visibleEditNote, setVisibleEditNote] = useState(false);
  const [datePickerHidden, setDatePickerHidden] = useState(true);
  const [timePickerHidden, setTimePickerHidden] = useState(true);
  //for notifications
  const [expoPushToken, setExpoPushToken] = useState("");
  const [notification, setNotification] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();
  // notification set up
  useEffect(() => {
    registerForPushNotificationsAsync().then((token) =>
      setExpoPushToken(token)
    );

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(response);
      });

    return () => {
      Notifications.removeNotificationSubscription(
        notificationListener.current
      );
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  //  retrieve notes from local storage
  useEffect(() => {
    const retrieveNotes = async () => {
      const notes = await getNotes("notes");
      setNotes(notes);
      setFilteredNotes(notes);
    };
    retrieveNotes();
    // Get User locale
    const locale = NativeModules.I18nManager.localeIdentifier;
    setLocale(locale === undefined ? "en-US" : locale.replace("_", "-"));
  }, []);
  const toggleMenu = () => {
    setShowMenu(!showMenu);
    Animated.timing(slideAnim, {
      toValue: showMenu ? width : 250,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };
  const filterNotes = () => {
    if (searchValue === "") return;
    const filteredNotes = notes.filter((note) =>
      note.title.toLowerCase().includes(searchValue.toLowerCase())
    );
    setFilteredNotes(filteredNotes);
  };

  const toggleAddNoteOverlay = () => {
    setNoteToEdit({
      id: 0,
      content: "",
      title: "",
      dateCreated: new Date(),
      deadlineDate: new Date(),
      priority: "green",
    });
    setVisibleAddNote(!visibleAddNote);
  };
  const handleAdd = async () => {
    setVisibleAddNote(!visibleAddNote);
    console.log(noteToEdit.deadlineDate);
    let date = new Date(noteToEdit.deadlineDate);
    console.log(date);
    //Add 10 seconds to the current date to test it.
    date.setSeconds(date.getSeconds() + 10);
    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: noteToEdit.title + " is due now",
        body: noteToEdit.content,
      },
      trigger: { date: date },
    });
    const newNote = {
      id: uuid.v4(),
      content: noteToEdit.content,
      title: noteToEdit.title,
      dateCreated: new Date(),
      deadlineDate: noteToEdit.deadlineDate,
      priority: noteToEdit.priority,
      notificationID: identifier,
    };
    setNotes([...notes, newNote]);
    setFilteredNotes([...notes, newNote]);
    //add notification when the task is due

    await saveNotes("notes", [...notes, newNote]);
  };
  const deleteNote = async (id) => {
    const notificationIDToDelete = notes.find((note) => note.id == id);
    const updatedNotes = notes.filter((note) => note.id !== id);
    setFilteredNotes([...updatedNotes]);
    setNotes([...updatedNotes]);
    await Notifications.cancelScheduledNotificationAsync(
      notificationIDToDelete.notificationID
    );
    await saveNotes("notes", updatedNotes);
  };

  const handleInputChange = (name, value) => {
    setNoteToEdit({ ...noteToEdit, [name]: value });
  };

  const toggleEditOverlay = (note) => {
    console.log("testentry");
    console.log(note);
    if (visibleEditNote) {
      console.log("test");
      setNoteToEdit({
        id: note.id,
        content: "",
        title: "",
        dateCreated: new Date(),
        priority: "green",
        deadlineDate: new Date(),
      });
    } else {
      console.log("test1");
      setNoteToEdit({ ...note });
      console.log("test2");
    }
    console.log(visibleEditNote);
    setVisibleEditNote(!visibleEditNote);
    console.log("test3");
  };
  const editNote = async () => {
    console.log(notes);
    console.log(noteToEdit);
    const updatedNotes = notes.map((note) =>
      note.id === noteToEdit.id ? noteToEdit : note
    );
    setFilteredNotes([...updatedNotes]);
    setNotes([...updatedNotes]);
    await saveNotes("notes", updatedNotes);
    toggleEditOverlay(noteToEdit);
  };
  const handleDateChange = (_, selectedDate) => {
    const currentDate = selectedDate || noteToEdit.deadlineDate;
    setDatePickerHidden(!datePickerHidden);
    setNoteToEdit({ ...noteToEdit, ["deadlineDate"]: currentDate });
  };
  const handleTimeChange = (_, selectedDate) => {
    const currentTime = selectedDate || noteToEdit.deadlineDate;
    setTimePickerHidden(!timePickerHidden);
    setNoteToEdit({ ...noteToEdit, ["deadlineDate"]: currentTime });
  };
  //notifications
  async function schedulePushNotification() {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "You've got mail! 📬",
        body: "Here is the notification body",
        data: { data: "goes here" },
      },
      trigger: { seconds: 2 },
    });
  }

  async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    //if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      alert("Failed to get push token for push notification!");
      return;
    }
    token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log(token);
    /*} else {
      alert("Must use physical device for Push Notifications");
    }*/

    return token;
  }

  return (
    <ThemeProvider theme={theme}>
      <View
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          //overflow: "scrollY",
          marginTop: 10,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignContent: "center",
            justifyContent: "center",
          }}
        >
          <View style={{ width: "80%", padding: 10 }}>
            <SearchBar
              platform="android"
              containerStyle={{ flex: 1 }}
              inputContainerStyle={{}}
              inputStyle={{}}
              leftIconContainerStyle={{}}
              rightIconContainerStyle={{}}
              loadingProps={{}}
              onChangeText={(newVal) => setSearchValue(newVal)}
              onClear={() => {
                setSearchValue("");
              }}
              placeholder="Search..."
              placeholderTextColor="#888"
              round
              onCancel={() => setSearchValue("")}
              cancelButtonTitle="Cancel"
              cancelButtonProps={{}}
              value={searchValue}
              onSubmitEditing={filterNotes}
              clearIcon={searchValue ? { color: "#888" } : null}
            />
          </View>
          <View style={styles.container}>
            <TouchableOpacity onPress={toggleMenu}>
              <Icon name="menu" raised size={25} color="black" />
            </TouchableOpacity>
            <Animated.View
              style={[
                styles.menuContainer,
                { transform: [{ translateX: slideAnim }] },
              ]}
            >
              <TouchableOpacity onPress={toggleMenu}>
                <Text style={styles.closeButton}>X</Text>
              </TouchableOpacity>
              <Text style={styles.menuItem}>Category 1</Text>
              <Text style={styles.menuItem}>Category 2</Text>
              <Text style={styles.menuItem}>Category 3</Text>
            </Animated.View>
          </View>
        </View>
        <ScrollView
          style={{
            height: "80%",
            width: "100%",
          }}
          contentContainerStyle={{
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {filteredNotes.map((note) => (
            <React.Fragment key={note.id}>
              <Overlay
                isVisible={visibleEditNote}
                onBackdropPress={() => toggleEditOverlay(note)}
                fullScreen
              >
                <Input
                  label="Title"
                  placeholder="Enter note title"
                  value={noteToEdit.title}
                  onChangeText={(value) => handleInputChange("title", value)}
                />
                <Input
                  label="Content"
                  placeholder="Enter note content"
                  value={noteToEdit.content}
                  onChangeText={(value) => handleInputChange("content", value)}
                />
                <Input
                  label="Deadline date"
                  placeholder="Enter deadline date"
                  value={noteToEdit.deadlineDate.toLocaleDateString(locale)}
                  rightIcon={
                    <Icon
                      name="calendar"
                      onPress={() => setDatePickerHidden(!datePickerHidden)}
                      type="font-awesome"
                    />
                  }
                  onChangeText={(value) =>
                    handleInputChange("deadlineDate", value)
                  }
                />
                <Input
                  label="Deadline time"
                  placeholder="Enter deadline time"
                  value={noteToEdit.deadlineDate
                    .toLocaleTimeString(locale)
                    .replace(/(.*)\D\d+/, "$1")}
                  rightIcon={
                    <Icon
                      name="clock-o"
                      onPress={() => setTimePickerHidden(!timePickerHidden)}
                      type="font-awesome"
                    />
                  }
                  onChangeText={(value) =>
                    handleInputChange("deadlineDate", value)
                  }
                />
                <Picker
                  selectedValue={noteToEdit.priority}
                  style={{ height: 50, width: 150 }}
                  onValueChange={(itemValue, itemIndex) =>
                    handleInputChange("priority", itemValue)
                  }
                >
                  <Picker.Item label="low" value="low" />
                  <Picker.Item label="mid" value="mid" />
                  <Picker.Item label="high" value="high" />
                </Picker>
                {!datePickerHidden && (
                  <DateTimePicker
                    locale={locale}
                    is24Hour={true}
                    onChange={handleDateChange}
                    value={note.deadlineDate}
                  />
                )}
                {!timePickerHidden && (
                  <DateTimePicker
                    locale={locale}
                    is24Hour={true}
                    minuteInterval={1}
                    mode="time"
                    onChange={handleTimeChange}
                    value={note.deadlineDate}
                  />
                )}
                <View
                  style={{
                    flexDirection: "row",
                    width: "100%",
                    justifyContent: "space-between",
                  }}
                >
                  <Button
                    title="Cancel"
                    onPress={() => toggleEditOverlay(note)}
                  />
                  <Button title="Confirm" onPress={() => editNote(note.id)} />
                </View>
              </Overlay>
              <Card
                key={note.id}
                containerStyle={{
                  width: "90%",
                  margin: 10,
                  borderColor: note.priority,
                }}
                style={{ borderColor: "red" }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <Card.Title>{note.title}</Card.Title>
                </View>
                <Card.Divider />
                <View
                  style={{
                    width: "100%",
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <View
                    style={{
                      width: "70%",
                    }}
                  >
                    <Text>{note.content}</Text>
                  </View>
                  <View
                    style={{
                      width: "20%",
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <Icon
                      name="pencil"
                      type="font-awesome"
                      size={15}
                      reverse
                      onPress={() => toggleEditOverlay(note)}
                    />
                    <Icon
                      name="trash"
                      type="font-awesome"
                      size={15}
                      reverse
                      onPress={() => deleteNote(note.id)}
                    />
                  </View>
                </View>
              </Card>
            </React.Fragment>
          ))}
        </ScrollView>
      </View>
      <View
        style={{
          width: "80%",
          display: "flex",
          height: 400,
          justifyContent: "center",
          alignItems: "center",
          marginTop: 10,

          right: "10%",
          bottom: 120,
        }}
      >
        <Overlay
          isVisible={visibleAddNote}
          onBackdropPress={() => setIsHidden(!isHidden)}
          fullScreen
        >
          <Input
            label="Title"
            placeholder="Enter note title"
            value={noteToEdit.title}
            onChangeText={(value) => handleInputChange("title", value)}
          />
          <Input
            label="Content"
            placeholder="Enter note content"
            value={noteToEdit.content}
            onChangeText={(value) => handleInputChange("content", value)}
          />
          <Input
            label="Deadline date"
            placeholder="Enter deadline date"
            value={noteToEdit.deadlineDate.toLocaleDateString(locale)}
            rightIcon={
              <Icon
                name="calendar"
                onPress={() => setDatePickerHidden(!datePickerHidden)}
                type="font-awesome"
              />
            }
            onChangeText={(value) => handleInputChange("deadlineDate", value)}
          />
          <Input
            label="Deadline time"
            placeholder="Enter deadline time"
            value={noteToEdit.deadlineDate
              .toLocaleTimeString(locale)
              .replace(/(.*)\D\d+/, "$1")}
            rightIcon={
              <Icon
                name="clock-o"
                onPress={() => setTimePickerHidden(!timePickerHidden)}
                type="font-awesome"
              />
            }
            onChangeText={(value) => handleInputChange("deadlineDate", value)}
          />
          <Picker
            selectedValue={noteToEdit.priority}
            style={{ height: 50, width: 150 }}
            onValueChange={(itemValue, itemIndex) =>
              handleInputChange("priority", itemValue)
            }
          >
            <Picker.Item label="low" value="green" />
            <Picker.Item label="mid" value="orange" />
            <Picker.Item label="high" value="red" />
          </Picker>
          {!datePickerHidden && (
            <DateTimePicker
              locale={locale}
              is24Hour={true}
              onChange={handleDateChange}
              value={noteToEdit.deadlineDate}
            />
          )}
          {!timePickerHidden && (
            <DateTimePicker
              locale={locale}
              is24Hour={true}
              minuteInterval={1}
              mode="time"
              onChange={handleTimeChange}
              value={noteToEdit.deadlineDate}
            />
          )}

          <View
            style={{
              flexDirection: "row",
              width: "100%",
              justifyContent: "space-between",
            }}
          >
            <Button title="Cancel" onPress={toggleAddNoteOverlay} />
            <Button title="Add Note" onPress={() => handleAdd()} />
          </View>
        </Overlay>
      </View>
      <FAB
        icon={{ name: "add", color: "white" }}
        color="green"
        style={{
          position: "absolute",
          width: 50,
          height: 50,
          alignItems: "center",
          justifyContent: "center",
          right: 170,
          bottom: 20,
        }}
        onPress={toggleAddNoteOverlay}
      />
    </ThemeProvider>
  );
};
const styles = StyleSheet.create({
  addButton: {
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.2)",
    alignItems: "center",
    justifyContent: "center",
    width: 70,
    position: "absolute",
    bottom: 0,
    right: 10,
    height: 70,
    backgroundColor: "#fff",
    borderRadius: 100,
  },
  container: {
    width: "20%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "white",
    padding: 10,
  },
  menuContainer: {
    position: "absolute",
    left: -300,
    top: 0,
    width: 250,
    backgroundColor: "white",
    padding: 10,
  },
  closeButton: {
    fontSize: 20,
    fontWeight: "bold",
    color: "black",
    marginBottom: 10,
  },
  menuItem: {
    fontSize: 16,
    padding: 10,
  },
});
export default App;
