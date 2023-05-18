import React, { useState, useEffect, useRef } from "react";
import {
  Platform,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  NativeModules,
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
  CheckBox,
} from "@rneui/themed";
import DateTimePicker from "@react-native-community/datetimepicker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import uuid from "react-native-uuid";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Picker } from "@react-native-picker/picker";
import { LinearGradient } from "expo-linear-gradient";
import Statistics from "./Statistics";
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
  const { width, height } = Dimensions.get("window");
  const [noteToEdit, setNoteToEdit] = useState({
    id: 0,
    content: "",
    title: "",
    completed: false,

    priority: "Low",
    category: "Personal",

    dateCreated: new Date(),
    deadlineDate: new Date(),
    dateCompleted: null,
  });
  const [filter, setFilter] = useState({
    category: "Personal",
    priority: "Low",
    completed: false,
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
  const [showMenuOverlay, setShowMenuOverlay] = useState(false);
  const [showFilterOverlay, setShowFilterOverlay] = useState(false);
  const [showStatisticsOverlay, setShowStatisticsOverlay] = useState(false);

  const toggleFilter = () => {
    setShowFilterOverlay((showFilterOverlay) => !showFilterOverlay);
  };
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
      const modifiedNotes = [];
      notes.forEach((element) => {
        modifiedNotes.push({
          ...element,
          ["deadlineDate"]: new Date(element.deadlineDate),
          ["dateCreated"]: new Date(element.dateCreated),
          ["dateCompleted"]:
            element.dateCompleted === null
              ? null
              : new Date(element.dateCompleted),
        });
      });
      setNotes(modifiedNotes);
      setFilteredNotes(modifiedNotes);
    };
    retrieveNotes();
    // Get User locale
    const locale = NativeModules.I18nManager.localeIdentifier;
    setLocale(locale === undefined ? "en-US" : locale.replace("_", "-"));
  }, []);

  const searchNotes = () => {
    if (searchValue === "") {
      setFilteredNotes(notes);
      return;
    }
    const filteredNotes = notes.filter(
      (note) =>
        note.title.toLowerCase().includes(searchValue.toLowerCase()) ||
        note.content.toLowerCase().includes(searchValue.toLowerCase())
    );
    setFilteredNotes(filteredNotes);
  };
  const filterNotes = () => {
    const filteredNotes = notes.filter(
      (note) =>

        (note.category === filter.category &&
          note.priority === filter.priority &&
        note.completed === filter.completed) ||
        (filter.category === "All" && note.priority === filter.priority) ||
        (filter.priority === "All" && note.category === filter.category) ||
        (filter.category === "All" && filter.priority === "All")

    );
    setFilteredNotes(filteredNotes);
    toggleFilter();
  };
  const toggleAddNoteOverlay = () => {
    setNoteToEdit({
      id: 0,
      content: "",
      title: "",
      completed: false,
      dateCreated: new Date(),
      deadlineDate: new Date(),
      dateCompleted: null,
      priority: "Low",
      category: "Personal",
    });
    setVisibleAddNote(!visibleAddNote);
  };
  const addNotifications = async () => {
    let date = new Date(noteToEdit.deadlineDate);

    //Add 10 seconds to the current date to test it.

    const notificationIDs = [];
    console.log(noteToEdit.priority);
    if (noteToEdit.priority == "Low") {
      date.setSeconds(date.getSeconds() + 10);
      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: noteToEdit.title + " is due now",
          body: noteToEdit.content,
        },
        trigger: { date: date },
      });
      notificationIDs.push(identifier);
    } else if (noteToEdit.priority == "Mid") {
      date.setSeconds(date.getSeconds() + 10);
      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: noteToEdit.title + " is due now",
          body: noteToEdit.content,
        },
        trigger: { date: date },
      });
      notificationIDs.push(identifier);
      //date.setSeconds(0);
      date.setHours(date.getHours() - 1);
      date.setMinutes(date.getMinutes() + 1);
      const identifierHourBefore =
        await Notifications.scheduleNotificationAsync({
          content: {
            title: noteToEdit.title + " is due in an hour",
            body: noteToEdit.content,
          },
          trigger: { date: date },
        });
      notificationIDs.push(identifierHourBefore);
    } else if (noteToEdit.priority == "High") {
      date.setSeconds(date.getSeconds() + 10);
      console.log(date);
      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: noteToEdit.title + " is in now",
          body: noteToEdit.content,
        },
        trigger: { date: date },
      });
      notificationIDs.push(identifier);
      //date.setSeconds(0);
      date.setHours(date.getHours() - 1);
      date.setMinutes(date.getMinutes() + 1);
      console.log(date);
      const identifierHourBefore =
        await Notifications.scheduleNotificationAsync({
          content: {
            title: noteToEdit.title + " is due in an hour",
            body: noteToEdit.content,
          },
          trigger: { date: date },
        });
      notificationIDs.push(identifierHourBefore);
      date.setSeconds(0);
      date.setHours(0);
      console.log(date);
      const identifierDay = await Notifications.scheduleNotificationAsync({
        content: {
          title: noteToEdit.title + " is due today",
          body: noteToEdit.content,
        },
        trigger: { date: date },
      });
      notificationIDs.push(identifierDay);
    }
    console.log(notificationIDs);
    console.log("comparison");
    return notificationIDs;
  };
  const handleAdd = async () => {
    setVisibleAddNote(!visibleAddNote);
    console.log(noteToEdit.deadlineDate);
    //add notification when the task is due
    const notificationIDArray = await addNotifications();
    console.log(notificationIDArray);
    const newNote = {
      id: uuid.v4(),
      content: noteToEdit.content,
      title: noteToEdit.title,
      completed: false,
      dateCreated: new Date(),
      dateCompleted: null,
      category: noteToEdit.category,
      deadlineDate: noteToEdit.deadlineDate,

      priority: noteToEdit.priority,
      notificationIDs: notificationIDArray,
    };
    setNotes([...notes, newNote]);
    setFilteredNotes([...notes, newNote]);

    await saveNotes("notes", [...notes, newNote]);
  };
  const deleteNote = async (id) => {
    const notificationIDToDelete = notes.find((note) => note.id == id);
    const updatedNotes = notes.filter((note) => note.id !== id);
    setFilteredNotes([...updatedNotes]);
    setNotes([...updatedNotes]);
    console.log(notificationIDToDelete.notificationIDs);
    await saveNotes("notes", updatedNotes);
    try {
      notificationIDToDelete.notificationIDs.forEach(async (element) => {
        await Notifications.cancelScheduledNotificationAsync(element);
      });
    } catch (error) {
      console.log(error);
    }
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
        completed: false,
        category: "Personal",
        dateCreated: new Date(),
        dateCompleted: null,
        priority: "Low",

        deadlineDate: new Date(),
      });
    } else {
      console.log("test1");
      setNoteToEdit({ ...note, ["deadlineDate"]: note.deadlineDate });
      console.log("test2");
    }
    console.log(visibleEditNote);
    console.log(noteToEdit.deadlineDate);
    setVisibleEditNote(!visibleEditNote);
    console.log("test3");
  };
  const toggleMenuOverlay = (note) => {
    if (visibleEditNote) {
      setNoteToEdit({
        id: note.id,
        content: "",
        title: "",
        completed: false,
        category: "Personal",
        dateCreated: new Date(),
        priority: "Low",
        dateCompleted: null,
        deadlineDate: new Date(),
      });
    } else {
      setNoteToEdit({ ...note, ["deadlineDate"]: note.deadlineDate });
    }
    setShowMenuOverlay(!showMenuOverlay);
  };

  const editNote = async (note) => {
    if (note !== undefined) {
      noteToEdit = { ...note };
    }

    console.log(notes);
    console.log(noteToEdit);
    //delete pre-edit notifications
    const notificationIDToDelete = notes.find(
      (note) => note.id == noteToEdit.id
    );
    console.log(notificationIDToDelete);
    try {
      notificationIDToDelete.notificationIDs.forEach(async (element) => {
        await Notifications.cancelScheduledNotificationAsync(element);
      });
    } catch (error) {
      console.log(error);
    }

    const newNotificationsIDS = addNotifications();
    console.log(newNotificationsIDS);
    setNoteToEdit({ ...noteToEdit, ["notificatonIDs"]: newNotificationsIDS });

    const updatedNotes = notes.map((note) =>
      note.id === noteToEdit.id ? noteToEdit : note
    );
    setFilteredNotes([...updatedNotes]);
    setNotes([...updatedNotes]);
    //delete pre-edit notifications
    await saveNotes("notes", updatedNotes);
    toggleEditOverlay(noteToEdit);
  };
  const handleDateChange = (_, selectedDate) => {
    const currentDate = selectedDate || noteToEdit.deadlineDate;
    setDatePickerHidden(true);
    setNoteToEdit({ ...noteToEdit, ["deadlineDate"]: currentDate });
  };
  const handleTimeChange = (_, selectedDate) => {
    const currentTime = selectedDate || noteToEdit.deadlineDate;
    setTimePickerHidden(true);
    setNoteToEdit({ ...noteToEdit, ["deadlineDate"]: currentTime });
  };

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
          <View
            style={{
              width: "100%",
              flexDirection: "row",
              alignContent: "center",
              justifyContent: "center",
              paddingTop: 25,
              paddingBottom: 15,
            }}
          >
            <View style={{ width: "65%" }}>
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
                  setFilteredNotes(notes);
                  setSearchValue("");
                }}
                placeholder="Search..."
                placeholderTextColor="#888"
                round
                onCancel={() => {
                  setFilteredNotes(notes);
                  setSearchValue("");
                }}
                cancelButtonTitle="Cancel"
                cancelButtonProps={{}}
                value={searchValue}
                onSubmitEditing={searchNotes}
                clearIcon={searchValue ? { color: "#888" } : null}
              />
            </View>
            <View
              style={{ width: "35%", display: "flex", flexDirection: "row" }}
            >
              <Icon
                name="pie-chart"
                raised
                size={22}
                type="font-awesome"
                onPress={() =>
                  setShowStatisticsOverlay(
                    (showStatisticsOverlay) => !showStatisticsOverlay
                  )
                }
              />

              <Icon
                name="filter"
                raised
                size={22}
                onPress={toggleFilter}
                type="font-awesome"
              />
            </View>
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
                      onPress={() =>
                        setDatePickerHidden(
                          (datePickerHidden) => !datePickerHidden
                        )
                      }
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
                      onPress={() =>
                        setTimePickerHidden(
                          (timePickerHidden) => !timePickerHidden
                        )
                      }
                      type="font-awesome"
                    />
                  }
                  onChangeText={(value) =>
                    handleInputChange("deadlineDate", value)
                  }
                />

                <View style={{ paddingBottom: 25 }}>
                  <Input
                    label="Category"
                    inputContainerStyle={{ display: "none" }}
                  />

                  <Picker
                    selectedValue={noteToEdit.category}
                    style={{ height: 50, width: 150 }}
                    onValueChange={(value) =>
                      handleInputChange("category", value)
                    }
                  >
                    <Picker.Item label="Personal" value="Personal" />
                    <Picker.Item label="Work" value="Work" />
                  </Picker>
                </View>
                <View style={{ paddingBottom: 25 }}>
                  <Input
                    label="Priority"
                    inputContainerStyle={{ display: "none" }}
                  />
                  <Picker
                    selectedValue={noteToEdit.priority}
                    style={{ height: 50, width: 150 }}
                    onValueChange={(itemValue, _) =>
                      handleInputChange("priority", itemValue)
                    }
                  >
                    <Picker.Item label="Low" value="Low" />
                    <Picker.Item label="Medium" value="Medium" />
                    <Picker.Item label="High" value="High" />
                  </Picker>
                </View>

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

                  borderColor:
                    note.priority === "Low"
                      ? "green"
                      : note.priority === "Mid"
                      ? "orange"
                      : "red",
                  borderWidth: 1,
                  backgroundColor:
                    note.priority === "Low"
                      ? "green"
                      : note.priority === "Mid"
                      ? "orange"
                      : "red",
                  flex: 1,
                  borderRadius: 10,
                  padding: 0,
                }}
              >
                <LinearGradient
                  // Background Linear Gradient
                  colors={["white", "transparent"]}
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    top: 0,
                    height: "100%",
                    borderRadius: 10,
                  }}
                />

                <View
                  style={{
                    padding: 15,
                  }}
                >
                  <View
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <View
                      style={{
                        width: "60%",
                        flexDirection: "row",
                        paddingLeft: 10,
                      }}
                    >
                      <Card.Title>{note.title}</Card.Title>
                    </View>
                    <View
                      style={{
                        width: "40%",
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "center",
                        alignItems: "center",
                        paddingLeft: 10,
                      }}
                    >
                      <Text style={{ fontWeight: "bold" }}>Completed</Text>
                      <CheckBox
                        containerStyle={{ backgroundColor: "transparent" }}
                        right
                        size={28}
                        checked={note.completed}
                        onPress={async () => {
                          const updatedNotes = notes.map((n) => {
                            if (n.id === note.id) {
                              return {
                                ...n,
                                completed: !n.completed,
                                dateCompleted:
                                  n.dateCompleted === null ? new Date() : null,
                              };
                            }
                            return n;
                          });

                          setNotes(updatedNotes);
                          setFilteredNotes(updatedNotes);
                          await saveNotes("notes",updatedNotes)
                        }}
                      />
                    </View>
                  </View>
                  <Overlay
                    isVisible={showMenuOverlay}
                    onBackdropPress={() => toggleMenuOverlay(note)}
                  >
                    <View
                      style={{
                        width: width * 0.85,
                        height: height * 0.5,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        padding: 0,
                        margin: 0,
                      }}
                    >
                      <View
                        style={{
                          position: "absolute",
                          top: 0,
                          right: 0,
                          height: 100,
                        }}
                      >
                        <Icon
                          name="close"
                          raised
                          size={20}
                          onPress={() => toggleMenuOverlay(note)}
                          type="font-awesome"
                        />
                      </View>
                      <Card
                        containerStyle={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <View
                          style={{
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "center",
                            alignItems: "center",
                            position: "relative",
                          }}
                        >
                          <Card.Title>Title: {noteToEdit.title}</Card.Title>
                        </View>
                        <Card.Divider />
                        <Text>Content: {noteToEdit.content}</Text>
                        <Card.Divider />
                        <Text>Priority: {noteToEdit.priority}</Text>
                        <Card.Divider />

                        <Text>Category: {noteToEdit.category}</Text>
                        <Card.Divider />

                        <Text>
                          Date Created:{" "}
                          {new Date(noteToEdit.dateCreated).toLocaleString(
                            locale
                          )}
                        </Text>
                        <Card.Divider />

                        <Text>
                          Deadline Date:{" "}
                          {new Date(noteToEdit.deadlineDate).toLocaleString(
                            locale
                          )}
                        </Text>
                        <Card.Divider />

                        <Text>
                          Completed: {noteToEdit.completed ? "Yes" : "No"}
                        </Text>
                      </Card>
                    </View>
                  </Overlay>
                  <Card.Divider />

                  <View
                    style={{
                      padding: 15,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <View
                        style={{
                          width: "60%",
                          flexDirection: "row",
                        }}
                      >
                        <Card.Title>{note.content}</Card.Title>
                      </View>
                      <TouchableOpacity
                        style={{ width: "60%", paddingRight: 20 }}
                        onPress={() => toggleMenuOverlay(note)}
                      >
                        <View
                          style={{
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <Text style={{ fontWeight: "bold" }}>Details</Text>
                          <Icon
                            name="angle-right"
                            type="font-awesome"
                            size={18}
                            raised
                            onPress={() => toggleMenuOverlay(note)}
                          />
                        </View>
                      </TouchableOpacity>
                    </View>
                    <Card.Divider />
                    <View
                      style={{
                        width: "100%",
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <View
                        style={{
                          width: "50%",
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Icon
                          name="pencil"
                          type="font-awesome"
                          size={18}
                          raised
                          onPress={() => toggleEditOverlay(note)}
                        />
                      </View>
                      <View
                        style={{
                          width: "50%",
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Icon
                          name="trash"
                          type="font-awesome"
                          size={18}
                          raised
                          onPress={() => deleteNote(note.id)}
                        />
                      </View>
                    </View>
                  </View>
                </View>
              </Card>
            </React.Fragment>
          ))}
          <Overlay isVisible={showFilterOverlay} onBackdropPress={toggleFilter}>
            <View
              style={{
                width: width * 0.85,
                height: height * 0.5,
                display: "flex",
                position: "relative",
                padding: 0,
                margin: 0,
              }}
            >
              <View style={{ paddingTop: 10 }}>
                <Input
                  label="Filter by category"
                  inputContainerStyle={{ display: "none" }}
                />

                <Picker
                  style={{ height: 50, width: 150 }}
                  selectedValue={filter.category}
                  onValueChange={(value) =>
                    setFilter({ ...filter, category: value })
                  }
                >
                  <Picker.Item label="Personal" value="Personal" />
                  <Picker.Item label="Work" value="Work" />
                  <Picker.Item label="All" value="All" />
                </Picker>
              </View>
              <View style={{ paddingTop: 10 }}>
                <Input
                  label="Filter by priority"
                  inputContainerStyle={{ display: "none" }}
                />
                <Picker
                  selectedValue={filter.priority}
                  style={{ height: 50, width: 150 }}
                  onValueChange={(value) =>
                    setFilter({ ...filter, priority: value })
                  }
                >
                  <Picker.Item label="Low" value="Low" />
                  <Picker.Item label="Medium" value="Medium" />
                  <Picker.Item label="High" value="High" />
                  <Picker.Item label="All" value="All" />
                </Picker>
              </View>
              <View style={{ paddingTop: 10 }}>
                <Input
                  label="Filter by completion"
                  inputContainerStyle={{ display: "none" }}
                />
                <Picker
                  selectedValue={filter.completed}
                  style={{ height: 50, width: 150 }}
                  onValueChange={(value) =>
                    setFilter({ ...filter, completed: value })
                  }
                >
                  <Picker.Item label="Yes" value={true} />
                  <Picker.Item label="No" value={false} />
                </Picker>
              </View>
              <View
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  position: "absolute",
                  bottom: 0,
                  padding: 10,
                }}
              >
                <Button
                  title="Cancel"
                  onPress={() => {
                    toggleFilter();
                    setFilteredNotes(notes);
                  }}
                />
              </View>
              <View
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  padding: 10,
                }}
              >
                <Button title="Filter " onPress={() => filterNotes()} />
              </View>
            </View>
          </Overlay>
          <Overlay
            isVisible={showStatisticsOverlay}
            onBackdropPress={() =>
              setShowStatisticsOverlay(
                (showStatisticsOverlay) => !showStatisticsOverlay
              )
            }
            fullScreen
          >
            <Statistics notes={notes} width={width}/>
            <View
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: 20,
              }}
            >
              <Button
                containerStyle={{ width: "50%" }}
                title="Back"
                onPress={() => {
                  setShowStatisticsOverlay(
                    (showStatisticsOverlay) => !showStatisticsOverlay
                  );
                }}
              />
            </View>
          </Overlay>
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

          <View style={{ paddingBottom: 25 }}>
            <Input label="Category" inputContainerStyle={{ display: "none" }} />

            <Picker
              style={{ height: 50, width: 150 }}
              selectedValue={noteToEdit.category}
              onValueChange={(value) => handleInputChange("category", value)}
            >
              <Picker.Item label="Personal" value="Personal" />
              <Picker.Item label="Work" value="Work" />
            </Picker>
          </View>
          <View style={{ paddingBottom: 25 }}>
            <Input label="Priority" inputContainerStyle={{ display: "none" }} />
            <Picker
              selectedValue={noteToEdit.priority}
              style={{ height: 50, width: 150 }}
              onValueChange={(itemValue) =>
                handleInputChange("priority", itemValue)
              }
            >
              <Picker.Item label="Low" value="Low" />
              <Picker.Item label="Medium" value="Medium" />
              <Picker.Item label="High" value="High" />
            </Picker>
          </View>

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

export default App;
