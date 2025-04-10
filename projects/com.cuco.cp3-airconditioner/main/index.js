
import React from "react";
import { createRootStack } from "./navigate";
export default class App extends React.PureComponent {
  render() {
    const Root = createRootStack('RootLoading');
    return <Root />;
  }      
}