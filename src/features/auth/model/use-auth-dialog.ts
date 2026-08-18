import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const AUTH_HASH = "#auth";

export function useAuthDialog() {
  const location = useLocation();
  const navigate = useNavigate();

  const isOpen = location.hash === AUTH_HASH;

  const handleOpen = useCallback(() => {
    navigate(
      {
        pathname: location.pathname,
        search: location.search,
        hash: AUTH_HASH,
      },
      { replace: true },
    );
  }, [location.pathname, location.search, navigate]);

  const handleClose = useCallback(() => {
    navigate(
      {
        pathname: location.pathname,
        search: location.search,
        hash: "",
      },
      { replace: true },
    );
  }, [location.pathname, location.search, navigate]);

  return {
    isOpen,
    handleOpen,
    handleClose,
  };
}
