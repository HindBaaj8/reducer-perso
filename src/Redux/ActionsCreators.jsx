import { CHANGE_NAME, CHANGE_CLASS, CHANGE_STAT } from "./ActionsTypes";

export function changeName(name) {
  return { type: CHANGE_NAME, payload: name };
}


export function changeClass(className) {
  return { type: CHANGE_CLASS, payload: className };
}

export function changeStat(stat, value) {
  return { type: CHANGE_STAT, payload: { stat, value } };
}







