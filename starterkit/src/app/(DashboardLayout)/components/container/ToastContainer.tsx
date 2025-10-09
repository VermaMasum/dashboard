import { ToastContainer, toast } from "react-toastify";
import PageContainer from "./PageContainer";
import "react-toastify/dist/ReactToastify.css";

export default function ToastContainerComponent() {
  const handleInvalidCredentials = () => {
    toast.error(" Invalid credentials. Please try again!");
  };

  return (
    <PageContainer title="Register Page" description="">
      {/* your page content */}
      <button onClick={handleInvalidCredentials}>Test Toast</button>

      {/* ✅ React-Toastify container */}
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
    </PageContainer>
  );
}
