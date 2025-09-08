// App.js
import React, { useReducer, createContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import AppNavigator from "./src/navigation/AppNavigator";
import { initialState, reducer } from "./src/state/quizReducer";

export const QuizContext = createContext(null);

export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <QuizContext.Provider value={{ state, dispatch }}>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </QuizContext.Provider>
  );
}

