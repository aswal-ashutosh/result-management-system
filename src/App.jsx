import HomePage from "./pages/home_page/HomePage";
import AdminPanel from "./pages/admin_panel/AdminPanel";
import Result from "./pages/result_page/Result";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import ClassPanel from "./pages/class_panel/ClassPanel";

function App() {
  return (
    <div>
      <Router>
        <Switch>
          <Route exact path="/">
            <HomePage />
          </Route>
          <Route exact path="/adminPanel">
            <AdminPanel/>
          </Route>
          <Route exact path="/class">
            <ClassPanel/>
          </Route>
          <Route exact path="/studentResult">
            <Result></Result>
          </Route>
        </Switch>
      </Router>
    </div>
  );
}

export default App;
