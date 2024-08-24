import { Box, Paper, Snackbar, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { X } from "@phosphor-icons/react";
import { Item } from "../../types/Item";
import { useNavigate } from "react-router";
import itemsMap from "../../items.json";

export const ItemListScreen = () => {
  const [itemList, setItemList] = useState<Item[]>([]);
  const [toast, setToast] = useState({ message: "", open: false });

  const handleClose = () => {
    setToast({ open: false } as typeof toast);
  };

  useEffect(() => {
    const itemIdList = localStorage.getItem("item-list");

    if (itemIdList) {
      const parsedItemIdList: string[] = JSON.parse(itemIdList);

      if (parsedItemIdList?.length !== 0) {
        const filteredItems = itemsMap.filter((item) => {
          return parsedItemIdList.includes(item.id);
        });

        setItemList(filteredItems);
      }
    }
  }, []);

  const navigate = useNavigate();
  const clickHandler = (id: string) => {
    navigate(`/item/${id}`);
  };

  return (
    <Paper sx={{ padding: 2 }}>
      {itemList.map(({ id, name, image }) => {
        return (
          <Paper
            onClick={() => clickHandler(id)}
            key={id}
            sx={{
              cursor: "grab",
              display: "flex",
              alignItems: "center",
              padding: 2,
              width: "fit-content",
              flexDirection: "column",
              gap: 1,
              transition: "filter 0.3s ease-in-out, transform 0.3s ease-in-out",
              "&:hover": {
                transform: "scale(1.03)",
                filter: "brightness(1.4)",
              },
            }}
          >
            <Box component="img" src={image} width={100} />
            <Typography fontStyle="italic" color="#24B8F2">
              {name}
            </Typography>
          </Paper>
        );
      })}
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        open={toast.open}
        autoHideDuration={6000}
        onClose={handleClose}
        message={toast.message}
        action={<X onClick={handleClose} />}
      />
    </Paper>
  );
};
