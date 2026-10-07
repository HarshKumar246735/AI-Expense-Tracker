import client from "./client";

export const updateProfile = (data) => client.put("/users/profile", data);
export const updateSettings = (data) => client.put("/users/settings", data);
export const changePassword = (data) => client.put("/users/password", data);
export const uploadAvatar = (file) => {
  const form = new FormData();
  form.append("avatar", file);
  return client.post("/users/avatar", form);
};
