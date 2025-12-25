import { useSelector, useDispatch } from "react-redux";
import { changeName } from "../Redux/ActionsCreators";

export default function CharacterName() {
  const name = useSelector(state => state.name);
  const dispatch = useDispatch();

  return (
    <input
      type="text"
      value={name}
      onChange={(e) => dispatch(changeName(e.target.value))}
    />
  );
}
