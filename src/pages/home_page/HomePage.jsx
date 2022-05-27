import AdminLoginForm from "../../components/admin_login_form/AdminLoginForm";
import Navbar from "../../components/navbar/Navbar";
import "../home_page/HomePage.css";
import {useHistory} from 'react-router-dom';

function HomePage() {
  return (
    <div id="HomePage">
      <Navbar heading="Result Management System (R.M.S)"/>
      <div id="HomePageContent">
        <AdminLoginForm history={useHistory()}/>
      </div>
    </div>
  );
}

export default HomePage;
