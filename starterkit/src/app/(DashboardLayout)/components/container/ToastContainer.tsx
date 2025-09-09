import { ToastContainer, toast } from "react-toastify";
import MetaContainer from "@/components/MetaContainer";
import "react-toastify/dist/ReactToastify.css";

export default function Register() {
  const handleInvalidCredentials = () => {
    toast.error(" Invalid credentials. Please try again!");
  };

  return (
    <MetaContainer title="Register Page" description="This is Sample page">
      {/* your page content */}
      <button onClick={handleInvalidCredentials}>Test Toast</button>

      {/* ✅ React-Toastify container */}
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
    </MetaContainer>
  );
}
