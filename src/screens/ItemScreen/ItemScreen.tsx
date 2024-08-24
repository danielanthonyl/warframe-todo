import {
  Box,
  Fade,
  Grid,
  Link,
  Paper,
  Snackbar,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import relicsMap from "../../relics-map.json";
import itemsMap from "../../items.json";
import itemScafoldMap from "../../item-scafold-map.json";
import { X } from "@phosphor-icons/react";
import { useParams } from "react-router";
import { Item } from "../../types/Item";
import { ItemStatus } from "../../types/ItemStatus";
import { PlusCircle, MinusCircle } from "@phosphor-icons/react";
import relicDropMap from "../../relic-drop-sorted-map.json";

type Part = keyof typeof itemScafoldMap;

interface Drop {
  name: string;
  rarity: string;
}

interface Rotation {
  rotation: string;
  drops: Drop[];
}

interface NewRelic {
  mission: string;
  rotations: Rotation[];
}

export const ItemScreen = () => {
  const { id: itemId } = useParams();
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [itemStatus, setItemStatus] = useState<ItemStatus | null>();
  const [toast, setToast] = useState({ message: "", open: false });
  const [hoveredRelicIndex, setHoveredRelicIndex] = useState<number | null>(
    null
  );

  const getRelicDropDetails = (relicName?: string) => {
    if (!relicName)
      throw new Error("can't get relic drop details. Relic name is undefined.");

    return relicDropMap
      .filter((relicDrop) =>
        relicDrop.rotations.some((rotation) =>
          rotation.drops.some((drop) => drop.name === relicName)
        )
      )
      .map((relicDrop) => ({
        ...relicDrop,
        rotations: relicDrop.rotations
          .filter((rotation) =>
            rotation.drops.some((drop) => drop.name === relicName)
          )
          .map((rotation) => ({
            ...rotation,
            drops: rotation.drops.filter((drop) => drop.name === relicName),
          })),
      }));
  };

  const sortRelic = (newRelicsArray: NewRelic[]) => {
    const extractPercentage = (rarity: string): number => {
      const match = rarity ? rarity.match(/(\d+(\.\d+)?)%/) : 0;
      return match ? parseFloat(match[1]) : 0;
    };

    const sortDropsByRarity = (rotation: Rotation) => {
      rotation.drops.sort((a, b) => {
        const rarityA = extractPercentage(a.rarity);
        const rarityB = extractPercentage(b.rarity);
        return rarityB - rarityA;
      });
    };

    const sortRotationsByMaxRarity = (mission: NewRelic) => {
      mission.rotations.sort((a, b) => {
        const maxRarityA = Math.max(
          ...a.drops.map((drop) => extractPercentage(drop.rarity))
        );
        const maxRarityB = Math.max(
          ...b.drops.map((drop) => extractPercentage(drop.rarity))
        );
        return maxRarityB - maxRarityA;
      });
    };

    const sortMissionsByMaxRarity = (relicsArray: NewRelic[]) => {
      relicsArray.sort((a, b) => {
        const maxRarityA = Math.max(
          ...a.rotations.flatMap((rotation) =>
            rotation.drops.map((drop) => extractPercentage(drop.rarity))
          )
        );
        const maxRarityB = Math.max(
          ...b.rotations.flatMap((rotation) =>
            rotation.drops.map((drop) => extractPercentage(drop.rarity))
          )
        );
        return maxRarityB - maxRarityA;
      });
    };

    newRelicsArray.forEach((mission) => {
      mission.rotations.forEach((rotation) => sortDropsByRarity(rotation));
      sortRotationsByMaxRarity(mission);
    });
    sortMissionsByMaxRarity(newRelicsArray);

    return newRelicsArray;
  };

  const [relicCount, setRelicCount] = useState<
    { count: number; name: string }[]
  >([]);

  const handleClose = () => {
    setToast({ open: false } as typeof toast);
  };

  const getRelics = (itemName: string) => {
    return itemsMap
      .filter((item) => item.name.includes(itemName))
      .map((item) =>
        relicsMap.find((relic) =>
          relic.items.some((relicItem) => relicItem.itemId === item.id)
        )
      )
      .filter((relic) => relic !== undefined);
  };

  useEffect(() => {
    const localStorageItemList = localStorage.getItem("item-list");
    if (localStorageItemList) {
      const parsedItemList: string[] = JSON.parse(localStorageItemList);

      if (parsedItemList?.length !== 0) {
        const foundItemId = parsedItemList.find(
          (parsedItemId) => parsedItemId === itemId
        );

        const foundItem = itemsMap.find((item) => foundItemId === item.id);

        if (!foundItem || !foundItemId) {
          throw new Error("couldn't find selected item.");
        }

        const itemStatus = localStorage.getItem(foundItem.name);

        if (!itemStatus) {
          throw new Error(`item not found. ${foundItem.name}`);
        }

        const retrievedItemStatus: ItemStatus = JSON.parse(itemStatus);

        setItemStatus(retrievedItemStatus);
        setSelectedItem(foundItem);

        const localStorageRelicCount = localStorage.getItem("relics");

        if (localStorageRelicCount) {
          const relicCountParse = JSON.parse(localStorageRelicCount);

          setRelicCount(relicCountParse);
        }
      }
    }
  }, [itemId]);

  if (!itemStatus || !selectedItem) return null;

  const handleAcquisition = (part: Part) => {
    const itemStatusCopy = { ...itemStatus };

    if (itemStatusCopy[part] === "acquired") {
      itemStatusCopy[part] = "unacquired";
    } else {
      itemStatusCopy[part] = "acquired";
    }

    localStorage.setItem(selectedItem.name, JSON.stringify(itemStatusCopy));
    setItemStatus(itemStatusCopy);
  };

  const findRelic = (part: Part) => {
    const relics = getRelics(selectedItem.name);

    const foundItem = itemsMap.find(({ name }) => {
      return name
        .toLowerCase()
        .includes(`${selectedItem.name} ${part}`.toLowerCase());
    });

    return relics.find((relic) => {
      return relic.items.some((relic) => {
        return relic.itemId === foundItem?.id;
      });
    });
  };

  const handleAddRelic = (relicName: string | undefined) => {
    const localStorageRelicCount = localStorage.getItem("relics");

    if (!relicName) throw new Error("Relic name is undefined.");

    const newRelicCount: (typeof relicCount)[number] = {
      name: relicName,
      count: 1,
    };

    if (!localStorageRelicCount) {
      localStorage.setItem("relics", JSON.stringify([newRelicCount]));
      setRelicCount([newRelicCount]);
    } else {
      const relicCountParse: typeof relicCount = JSON.parse(
        localStorageRelicCount
      );

      const foundRelic = relicCountParse.find(({ name }) => name === relicName);

      const relicCountCopy = [...relicCount];

      const foundRelicCopy = relicCountCopy.find(
        ({ name }) => name === relicName
      );

      if (!foundRelic || !foundRelicCopy) {
        relicCountParse.push(newRelicCount);
        relicCountCopy.push(newRelicCount);

        localStorage.setItem("relics", JSON.stringify(relicCountParse));
        setRelicCount(relicCountCopy);
        return;
      }

      foundRelic.count = foundRelic.count + 1;
      localStorage.setItem("relics", JSON.stringify(relicCountParse));

      foundRelicCopy.count = foundRelicCopy.count + 1;
      setRelicCount(relicCountCopy);
    }
  };

  const handleRemoveRelic = (relicName: string | undefined) => {
    const localStorageRelicCount = localStorage.getItem("relics");

    if (!relicName) throw new Error("Relic name is undefined.");

    const newRelicCount: (typeof relicCount)[number] = {
      name: relicName,
      count: 1,
    };

    if (!localStorageRelicCount) {
      return;
    } else {
      const relicCountParse: typeof relicCount = JSON.parse(
        localStorageRelicCount
      );

      const foundRelic = relicCountParse.find(({ name }) => name === relicName);

      const relicCountCopy = [...relicCount];

      const foundRelicCopy = relicCountCopy.find(
        ({ name }) => name === relicName
      );

      if (foundRelicCopy?.count === 0 || foundRelic?.count === 0) return;

      if (!foundRelic || !foundRelicCopy) {
        relicCountParse.push(newRelicCount);
        relicCountCopy.push(newRelicCount);

        localStorage.setItem("relics", JSON.stringify(relicCountParse));
        setRelicCount(relicCountCopy);
        return;
      }

      foundRelic.count = foundRelic.count - 1;
      localStorage.setItem("relics", JSON.stringify(relicCountParse));

      foundRelicCopy.count = foundRelicCopy.count - 1;
      setRelicCount(relicCountCopy);
    }
  };

  return !selectedItem ? (
    <Box>
      <Typography>List is Clear</Typography>
      <Link href="/">Add item</Link>
    </Box>
  ) : (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <Box
        sx={{
          flex: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        <Box component="img" src={selectedItem.image} width={200} />
        <Typography
          color="#24B8F2"
          variant="h5"
          fontWeight="bold"
          sx={{ marginBottom: 4 }}
        >
          {selectedItem?.name}
        </Typography>
      </Box>

      <Grid
        sx={{
          flex: 1,
        }}
        container
        justifyContent="center"
        alignItems="center"
      >
        {Object.keys(itemStatus).map((part, index) => {
          const relic = findRelic(part as Part);
          const relicDropDetails = getRelicDropDetails(relic?.name);
          const sortedRelicDropDetails = sortRelic(
            relicDropDetails as NewRelic[]
          );

          const foundRelicCount = relicCount.find((relicC) => {
            return relicC.name === relic?.name;
          });

          return (
            <Grid item justifyContent="center" sm={2} key={part}>
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  alignItems: "center",
                }}
              >
                <Typography fontWeight="bold">{part}</Typography>
                <Typography
                  sx={{
                    cursor: "grab",
                    "&:hover": { filter: "brightness(0.8)" },
                  }}
                  color={
                    itemStatus[part as Part] === "acquired" ? "green" : "#aaa"
                  }
                  onClick={() => handleAcquisition(part as Part)}
                >
                  Acquired
                </Typography>
              </Box>

              <Box
                onMouseEnter={() => setHoveredRelicIndex(index)}
                onMouseLeave={() => setHoveredRelicIndex(null)}
                sx={{ display: "flex", gap: 1, position: "relative" }}
              >
                <Typography sx={{ cursor: "grab" }}>{relic?.name}</Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <MinusCircle
                    style={{ cursor: "grab" }}
                    size={23}
                    onClick={() => handleRemoveRelic(relic?.name)}
                  />
                  <Typography>{foundRelicCount?.count || 0}</Typography>
                  <PlusCircle
                    style={{ cursor: "grab" }}
                    size={23}
                    onClick={() => handleAddRelic(relic?.name)}
                  />
                </Box>

                <Fade in={hoveredRelicIndex === index} timeout={300}>
                  <Paper
                    sx={{
                      position: "absolute",
                      top: 30,
                      zIndex: 1,
                      padding: 2,
                      maxHeight: 400,
                      overflow: "scroll",
                      backdropFilter: "blur(10px)",
                      backgroundColor: "rgba(0, 0, 0, 0.2)",
                      minWidth: 300,
                    }}
                  >
                    {sortedRelicDropDetails.map((relicDrop, index) => (
                      <Box key={index /* !DEBT */}>
                        <Typography
                          marginBottom={1}
                          fontWeight="500"
                          fontSize={14}
                        >
                          {relicDrop.mission}
                        </Typography>

                        <Box
                          sx={{
                            display: "flex",
                            gap: 6,
                          }}
                        >
                          {relicDrop.rotations.map((rotation) => (
                            <Box key={rotation.rotation}>
                              <Typography fontSize={14} fontWeight="500">
                                {rotation.rotation}
                              </Typography>
                              <Box
                                marginBottom={4}
                                sx={{
                                  display: "flex",
                                  flexDirection: "column",
                                }}
                              >
                                {rotation.drops.map((drop) => (
                                  <Typography
                                    variant="caption"
                                    fontStyle="italic"
                                    fontWeight="300"
                                    key={drop.name}
                                  >
                                    {drop.rarity}
                                  </Typography>
                                ))}
                              </Box>
                            </Box>
                          ))}
                        </Box>
                      </Box>
                    ))}
                  </Paper>
                </Fade>
              </Box>
            </Grid>
          );
        })}
      </Grid>

      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        open={toast.open}
        autoHideDuration={6000}
        onClose={handleClose}
        message={toast.message}
        action={<X onClick={handleClose} />}
      />
    </Box>
  );
};
