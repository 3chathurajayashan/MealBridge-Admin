import { Routes, Route } from "react-router-dom";
import Home from "./Pages/Home";
import SignIn from "./Pages/SignIn";

function App() {
  return (
    <Routes>
      {/* <Route path="/" element={<h1>Dashboard</h1>} />
      <Route path="/login" element={<h1>Login</h1>} />
      <Route path="/users" element={<h1>Users</h1>} />
      <Route path="/donations" element={<h1>Donations</h1>} /> */}
      <Route path="/" element={<Home />}></Route>
      <Route path="/signin" element={<SignIn />}></Route>
    </Routes>
  );
}

export default App;
