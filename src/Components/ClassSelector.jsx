import { useSelector, useDispatch } from "react-redux";
import { changeClass } from "../Redux/ActionsCreators";

export default function ClassSelector() {
  const selected = useSelector(state => state.class);
  const dispatch = useDispatch();

  return (
    <>
      <label>
        <input
          type="radio"
          checked={selected === "warrior"}
          onChange={() => dispatch(changeClass("warrior"))}
        /> Guerrier
      </label>

      <label>
        <input
          type="radio"
          checked={selected === "mage"}
          onChange={() => dispatch(changeClass("mage"))}
        /> Mage
      </label>

      <label>
        <input
          type="radio"
          checked={selected === "archer"}
          onChange={() => dispatch(changeClass("archer"))}
        /> Archer
      </label>
    </>
  );
}
