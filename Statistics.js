import React from "react";
import { ScrollView , Text } from "react-native";
import { PieChart } from "react-native-chart-kit";
import { ContributionGraph } from "react-native-chart-kit";
const Statistics = ({ notes, width}) => {
  const completedNotes = notes.filter((note) => note.completed);
  const completedCount = completedNotes.length;
  const totalCount = notes.length;
  const remaining = totalCount - completedCount;
  const completedTasksByDate = {};
  const priorityTypesCount = {
    Low : 0,
    Medium : 0,
    High : 0,
  }

  notes.forEach((note) => {
    if(priorityTypesCount[note.priority]!== undefined)
    {
      priorityTypesCount[note.priority]++;
    }
    if (note.dateCompleted) {
      const dateKey = note.dateCompleted.toISOString().split("T")[0];
      if (completedTasksByDate[dateKey]) {
        completedTasksByDate[dateKey]++;
      } else {
        completedTasksByDate[dateKey] = 1;
      }
    }
  });
  const data = Object.keys(completedTasksByDate).map((date) => ({
    date,
    count: completedTasksByDate[date],
  }));
  const pieChartData = [
    {
      name: "Completed",
      population: completedCount || 0,
      color: "green",
      legendFontColor: "green",
      legendFontSize: 14,
    },
    {
      name: "Remaining",
      population: remaining || 0,
      color:"red",
      legendFontColor: "red",
      legendFontSize: 14,
    },
  ];
  const pieChartDataPriorities = [
    {
      name: "Low priority",
      population: priorityTypesCount.Low || 0,
      color:  "green",
      legendFontColor: "green",
      legendFontSize: 14,
    },
    {
      name: "Medium priority",
      population: priorityTypesCount.Medium || 0,
      color: "orange",
      legendFontColor: "orange",
      legendFontSize: 14,
    },
    {
      name: "High priority",
      population: priorityTypesCount.High || 0,
      color: "red" ,
      legendFontColor: "red",
      legendFontSize: 14,
    },
  ];
  return (
    <ScrollView
      style={{
        width: width,
      }}
    >
      <Text style={{fontWeight:"bold"}}>
        Completed notes count:
      </Text>
      <PieChart
        style={{
          width: width,
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
        }}
        data={pieChartData}
        width={400}
        height={250}
        chartConfig={{
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        }}
        accessor="population"
        backgroundColor="transparent"
        absolute
      />
      <Text style={{fontWeight:"bold"}}>
        Notes by priority count:
      </Text>
      <PieChart
        style={{
          width: width,
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
        }}
        data={pieChartDataPriorities}
        width={400}
        height={250}
        chartConfig={{
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        }}
        accessor="population"
        backgroundColor="transparent"
        absolute
      />
      <Text style={{fontWeight:"bold"}}>
        Contribution chart:
      </Text>
      <ContributionGraph
        values={data}
        endDate={new Date()}
        numDays={65}
        width={300}
        height={220}
        chartConfig={{
          backgroundColor: "#ffffff",
          backgroundGradientFrom: "#ffffff",
          backgroundGradientTo: "#ffffff",
          color: (opacity = 1) => `rgba(0, 128, 0, ${opacity})`,
        }}
      />
    </ScrollView>
  );
};

export default Statistics;
