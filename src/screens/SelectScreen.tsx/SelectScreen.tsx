import {
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  Snackbar,
  Paper,
  Box,
} from "@mui/material";
import { useState } from "react";
import items from "../../items.json";
import { X } from "@phosphor-icons/react";
import itemScafoldMap from "../../item-scafold-map.json";
import { Button } from "../../components/Button/Button";
import { useNavigate } from "react-router";

export const SelectScreen = () => {
  const [item, setItem] = useState("");
  const [toast, setToast] = useState({ message: "", open: false });
  const navigate = useNavigate();

  const handleChange = ({ target: { value } }: SelectChangeEvent) => {
    setItem(value);
  };

  const handleGotoItemList = () => {
    navigate("/item-list");
  };

  const handleClose = () => {
    setToast({ open: false } as typeof toast);
  };

  const handleSubmit = () => {
    const localStorageItemList = localStorage.getItem("item-list");
    const newItem = items.find(({ id }) => id === item);

    if (!newItem) {
      setToast({ open: true, message: "Selected Item is not on the list." });
      throw new Error("selected item is not on the list.");
    }

    if (localStorageItemList) {
      const itemIdList: string[] = JSON.parse(localStorageItemList);

      const foundItem = itemIdList.find((itemId) => itemId === item);

      if (!foundItem) {
        itemIdList.push(newItem.id);
        localStorage.setItem("item-list", JSON.stringify(itemIdList));
        localStorage.setItem(newItem.name, JSON.stringify(itemScafoldMap));
      } else {
        setToast({ open: true, message: "Trying to add a duplicated item." });
        throw new Error("Trying to add a duplicated item.");
      }
    } else {
      localStorage.setItem("item-list", JSON.stringify([newItem.id]));
      localStorage.setItem(newItem.name, JSON.stringify(itemScafoldMap));
    }

    setToast({ open: true, message: "Item added!" });
  };

  return (
    <Box
      sx={{
        display: "flex",
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <Box
        sx={{
          flex: 20,
          alignItems: "center",
          justifyContent: "center",
          display: "flex",
        }}
      >
        <Paper sx={{ padding: 2, display: "inline-block" }}>
          <FormControl
            fullWidth
            sx={{ gap: 6, display: "flex", alignItems: "center" }}
          >
            <InputLabel id="item-selector-label">Item</InputLabel>
            <Select
              sx={{ color: "white", width: 400 }}
              labelId="item-selector-label"
              id="item-selector"
              value={item}
              label="Item"
              onChange={handleChange}
            >
              {items
                .filter((item) => item.categoryId === "1")
                .map(({ id, name }) => (
                  <MenuItem key={id} value={id}>
                    {name}
                  </MenuItem>
                ))}
            </Select>

            <Button onClick={handleSubmit}>ADD</Button>
          </FormControl>

          <Snackbar
            anchorOrigin={{ vertical: "top", horizontal: "right" }}
            open={toast.open}
            autoHideDuration={6000}
            onClose={handleClose}
            message={toast.message}
            action={<X onClick={handleClose} />}
          />
        </Paper>
      </Box>

      <Box
        sx={{
          padding: 3,
          flex: 1,
          display: "flex",
          justifyContent: "flex-end",
          alignSelf: "flex-end",
        }}
      >
        <Button disabled={item === ""} onClick={handleGotoItemList}>
          (A) ITEM LIST
        </Button>
      </Box>
    </Box>
  );
};
