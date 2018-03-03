import WeDeploy from "wedeploy";

export const AUTH = WeDeploy.auth("https://auth-great.wedeploy.io");

export const { currentUser } = AUTH;
