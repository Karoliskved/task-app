import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Platform,
  View,
  Text,
  ScrollView,
  TextInput,
  text,
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
} from "@rneui/themed";
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
      deadline: "2023-04-21",
    },
    {
      id: 2,
      content: "read 50 pages of a book",
      title: "Note 2",
      dateCreated: "2023-05-19",
      deadline: "2023-06-01",
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
          <Icon name="menu" size={30} style={{ padding: 20 }} />
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
            <Card key={note.id} containerStyle={{ width: "90%", margin: 10 }}>
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
                    onPress={() => console.log("Edit button pressed")}
                  />
                  <Icon
                    name="trash"
                    type="font-awesome"
                    size={15}
                    reverse
                    onPress={() => console.log("Delete button pressed")}
                  />
                </View>
              </View>
            </Card>
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
});
export default App;
