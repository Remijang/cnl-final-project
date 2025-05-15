import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const OAuthRedirect = ({ setToken }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const token = query.get("token");
    if (token) {
      localStorage.setItem("token", token);
      setToken(token);
      navigate("/");
    }
  }, [location, navigate, setToken]);

  return <p>Logging in with Google...</p>;
};

export default OAuthRedirect;
