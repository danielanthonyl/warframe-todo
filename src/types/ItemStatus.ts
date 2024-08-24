export type Status = "acquired" | "unacquired";

export interface ItemStatus {
  blueprint: Status;
  chassis: Status;
  neuroptics: Status;
  system: Status;
}
