import React, { useState, useEffect } from "react";
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
  ListItem,
  Input,
} from "@rneui/themed";
import DateTimePicker from '@react-native-community/datetimepicker';
// import AsyncStorage from '@react-native-async-storage/async-storage';
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
// const saveNotes = async (key, value) => {
//   try {
//     const jsonValue = JSON.stringify(value);
//     await AsyncStorage.setItem(key, jsonValue);
//     console.log('Notes saved successfully');
//   } catch (error) {
//     console.log('Error saving notes:', error);
//   }
// };
// retrieve notes from local storage
// const getNotes = async (key) => {
//   try {
//     const jsonValue = await AsyncStorage.getItem(key);
//     if (jsonValue !== null) {
//       const notes = JSON.parse(jsonValue);
//       console.log('Notes retrieved successfully:', notes);
//     } else {
//       console.log('Notes not found');
//     }
//   } catch (error) {
//     console.log('Error retrieving notes:', error);
//   }
// };
const App = () => {
  const [notes, setNotes] = useState([
    {
      id: 1,
      content: "walk the dog",
      title: "Note 1",
      dateCreated: "2023-04-19",
      deadlineDate: "2023-04-21",
      deadlineTime: "13:00",
    },
    {
      id: 2,
      content: "read 50 pages of a book",
      title: "Note 2",
      dateCreated: "2023-05-19",
      deadlineDate: "2023-06-01",
      deadlineTime: "15:30",
    },
  ]);
  const [filteredNotes, setFilteredNotes] = useState([...notes]);
  //  retrieve notes from local storage
  // useEffect(() => {
  //   let notes = getNotes('notes');
  //   setNotes(notes)
  //   setFilteredNotes(notes)
  // }, [])
  const [searchValue, setSearchValue] = useState("");
  const [isHidden, setIsHidden] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [slideAnim] = useState(new Animated.Value(400));
  const { width } = Dimensions.get("window");
  const toggleMenu = () => {
    setShowMenu(!showMenu);
    Animated.timing(slideAnim, {
      toValue: showMenu ? width : 250,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };
  const [newTitle, setnewTitle] = useState("");
  const [newDescription, setnewDescription] = useState("");
  const [newDate, setnewDate] = useState("");
  const filterNotes = () => {
    if (searchValue === "") return;
    const filteredNotes = notes.filter((note) =>
      note.title.toLowerCase().includes(searchValue.toLowerCase())
    );
    setFilteredNotes(filteredNotes);
  };
  const addNotes = (title, desc, deadline) => {
    //console.log("addclick");
    setIsHidden(!isHidden);
    //console.log(notes);
    notesCopy = [...notes];
    newNotesArray = notesCopy.concat([
      {
        id: notes[notes.length - 1].id + 1,
        content: desc,
        title: title,
        dateCreated: new Date(),
        deadline: deadline,
      },
    ]);
    // console.log(newNotesArray);
    setNotes(newNotesArray);
    //console.log(notes);
    setFilteredNotes(newNotesArray);
  };
  const handleAdd = () => {
    //console.log("handleadd");
    //console.log(newTitle);
    //console.log(newDescription);
    // console.log(newDate);
    addNotes(newTitle, newDescription, newDate);
  };
  const deleteNote = (id) => {
    const updatedNotes = notes.filter((note) => note.id !== id);
    setFilteredNotes(updatedNotes);
    setNotes(updatedNotes)
  };
  const [noteToEdit, setNoteToEdit] = useState({});
  const handleInputChange = (name, value) => {
    setNoteToEdit({...noteToEdit,[name]: value});
  };

  const editNote = () => {
    const updatedNotes = notes.map((note) =>
      note.id === noteToEdit.id ? noteToEdit : note
    );
    setFilteredNotes([...updatedNotes]);
    setNotes([...updatedNotes])
    toggleEditOverlay()
  };
  
  const [visibleEdit, setVisibleEdit] = useState(false);

  const toggleEditOverlay = (note) => {
    if (visibleEdit) {
      setNoteToEdit({})
    } else {
      setNoteToEdit({...note})
    }
    setVisibleEdit(!visibleEdit);

  };
  const locale = locale;
  const [datePickerHidden, setDatePickerHidden] = useState(true);
  const [timePickerHidden, setTimePickerHidden] = useState(true);
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date().toLocaleTimeString(locale));
  const handleDateChange = (_, selectedDate) => {
    const currentDate = selectedDate || date;
    setDatePickerHidden(!datePickerHidden);
    setNoteToEdit({...noteToEdit,["deadlineDate"]: currentDate.toLocaleDateString(locale)})
    setDate(currentDate);
  };
  const handleTimeChange = (_, selectedDate) => {
    const currentTime = selectedDate.toLocaleTimeString(locale)  || time;
    setTimePickerHidden(!timePickerHidden);
    setNoteToEdit({...noteToEdit,["deadlineTime"]: currentTime})
    setTime(currentTime);
  };
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
                isVisible={visibleEdit}
                onBackdropPress={()=>toggleEditOverlay(note)}
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
                  value={noteToEdit.deadlineDate}
                  rightIcon={<Icon name="calendar" onPress={()=>setDatePickerHidden(!datePickerHidden)} type="font-awesome"/>}
                  onChangeText={(value) => handleInputChange("deadlineDate", value)}
                />
                <Input
                  label="Deadline time"
                  placeholder="Enter deadline time"
                  value={noteToEdit.deadlineTime}
                  
                  rightIcon={<Icon name="clock-o" onPress={()=>setTimePickerHidden(!timePickerHidden)} type="font-awesome"/>}
                  onChangeText={(value) => handleInputChange("deadlineTime", value)}
                />
                {!datePickerHidden && <DateTimePicker locale={locale} is24Hour={true} onChange={handleDateChange} value={date} />}
                {!timePickerHidden && <DateTimePicker locale={locale} is24Hour={true} mode="time" onChange={handleTimeChange}  value={date} />}
                <View style={{flexDirection:"row",width:"100%",justifyContent:"space-between"}}>
                <Button title="Cancel" onPress={()=>toggleEditOverlay(note)} />
                <Button title="Confirm" onPress={()=>editNote(note.id)} />
                </View>
              </Overlay>
              <Card
                key={note.id}
                containerStyle={{ width: "90%", margin: 10}}
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
                      onPress={()=>toggleEditOverlay(note)}
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
      {!isHidden && (
        <View
          style={{
            width: "80%",
            display: "flex",
            height: 400,
            justifyContent: "center",
            alignItems: "center",
            //overflow: "scrollY",
            marginTop: 10,
            position: "absolute",
            backgroundColor: "#fff",
            borderWidth: 5,
            right: "10%",
            bottom: 120,
          }}
        >
          <Text>Title</Text>
          <TextInput
            style={{
              height: 40,
              margin: 12,
              borderWidth: 1,
              padding: 10,
              width: 300,
            }}
            onChangeText={(text) => setnewTitle(text)}
          />
          <Text>description</Text>
          <TextInput
            style={{
              height: 40,
              margin: 12,
              borderWidth: 1,
              padding: 10,
              width: 300,
            }}
            onChangeText={(text) => setnewDescription(text)}
          />
          <Text>Due by date</Text>
          <TextInput
            style={{
              height: 40,
              margin: 12,
              borderWidth: 1,
              padding: 10,
              width: 300,
            }}
            onChangeText={(text) => setnewDate(text)}
          />
          <Text>test</Text>
          <Button title="add button" onPress={() => handleAdd()} />
        </View>
      )}
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
          bottom: 50,
        }}
        onPress={() => setIsHidden(!isHidden)}
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
