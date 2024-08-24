import { Box, Typography } from "@mui/material";
import { ReactNode } from "react";

export interface ButtonProps
  extends React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > {
  children: ReactNode;
  onClick?: () => void;
}

export const Button = ({ children, onClick }: ButtonProps) => (
  <Box
    onClick={onClick}
    sx={{
      minWidth: 100,
      width: "fit-content",
      cursor: "grab",
      padding: "8px 16px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#303A58",
      outline: "1px solid transparent",
      borderBottom: "3px solid #2F6184",
      transition:
        "background 0.3s ease-in-out, border-bottom 0.3s ease-in-out, outline 0.3s ease-in-out",
      "&:hover": {
        background:
          "radial-gradient(circle closest-corner at 50% 190%, #FFF1BF, #303A58)",
        outline: "1px solid rgba(255, 241, 191, 0.2)",
        borderBottom: "3px solid #FFF1BF",
        "& .hover-text": {
          color: "#FFF1BF",
        },
      },
    }}
  >
    <Typography
      className="hover-text"
      sx={{
        color: "#24B8F2",
        transition: "color 0.1s ease-in-out",
      }}
      fontWeight="700"
    >
      {children}
    </Typography>
  </Box>
);
