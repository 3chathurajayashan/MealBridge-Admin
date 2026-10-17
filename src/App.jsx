import { Routes, Route } from "react-router-dom";
import Home from "./Pages/Home";
import SignIn from "./Pages/SignIn";
import AdminHome from "./Components/AdminComponent/AdminHome";
import AdminAnimation from "./Components/AdminComponent/AdminAnimation";
import UserManagement from "./Components/AdminComponent/AdComponents/UserManagement";
import UserProfile from "./Components/AdminComponent/AdComponents/UserProfile";
import AllDelivers from "./Components/DeliverManagement/AllDelivers";
import AssignDelivery from "./Components/DeliverManagement/AssignDelivery";
import Receipients from "./Components/RecipientCmponent/Receipients";

function App() {
  return (
    <Routes>
      {/* <Route path="/" element={<h1>Dashboard</h1>} />
      <Route path="/login" element={<h1>Login</h1>} />
      <Route path="/users" element={<h1>Users</h1>} />
      <Route path="/donations" element={<h1>Donations</h1>} /> */}
      <Route path="/" element={<Home />}></Route>
      <Route path="/signin" element={<SignIn />}></Route>
      <Route path="/admin/dashboard" element={<AdminHome />}></Route>
      <Route path="/admin/create" element={<AdminAnimation />}></Route>
      <Route path="/admin/user" element={<UserManagement />}></Route>
      <Route path="/admin/profile" element={<UserProfile />}></Route>
      <Route path="/admin/donations" element={<AllDelivers />}></Route>
      <Route path="/admin/delivers" element={<AssignDelivery />}></Route>
      <Route path="/admin/requests" element={<Receipients />}></Route>
    </Routes>
  );
}

export default App;
