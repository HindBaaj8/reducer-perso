const initialState = {
  name: "Aventurier",
  class: "warrior",
  stats: {
    strength: 5,
    intelligence: 5,
    agility: 5,
  },
  totalPoints: 15,
};

export default function ReducerPerso(state = initialState, action) {
  switch (action.type) {
    case "CHANGE_NAME":
      return { ...state, name: action.payload };

    case "CHANGE_CLASS":
      return { ...state, class: action.payload };

    case "CHANGE_STAT":
      return {...state,stats: {...state.stats,[action.payload.stat]: action.payload.value,},
      };

    default:
      return state;
  }
}
