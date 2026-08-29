import React from "react";
import SideBar from "./SideBar";
import AdminHeader from "./AdminHeader";
import AdminFooter from "./AdminFooter";

function AdminHome() {
  return (
    <div>
      <AdminHeader />
      <SideBar />
      <AdminFooter />
    </div>
  );
}

export default AdminHome;
