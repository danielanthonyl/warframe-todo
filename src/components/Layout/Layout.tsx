import { Box } from "@mui/material";
import { CaretLeft } from "@phosphor-icons/react";
import { Outlet, useLocation, useNavigate } from "react-router";

export const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isSelect = location.pathname === "/select";

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <Box
      sx={{
        height: "100%",
      }}
    >
      {isSelect ? null : (
        <CaretLeft
          style={{
            marginBottom: 60,
            cursor: "pointer",
            alignSelf: "start",
          }}
          onClick={handleGoBack}
        />
      )}

      <Outlet />
    </Box>
  );
};
