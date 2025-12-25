import { useSelector, useDispatch } from "react-redux";
import { changeStat } from "../Redux/ActionsCreators";
export default function StatsEditor() {

  const stats = useSelector(state => state.stats);
  const dispatch = useDispatch();

  return (
    <>
      <div>
        Force :
        <input
          type="number"
          min="0"
          max="5"
          value={stats.strength}
          onChange={(e) => dispatch(changeStat("strength", Number(e.target.value)))}
        />
      </div>

      <div>
        Intelligence :
        <input
          type="number"
          min="0"
          max="5"
          value={stats.intelligence}
          onChange={(e) => dispatch(changeStat("intelligence", Number(e.target.value)))}
        />
      </div>

      <div>
        Agilité :
        <input
          type="number"
          min="0"
          max="5"
          value={stats.agility}
          onChange={(e) => dispatch(changeStat("agility", Number(e.target.value)))}
        />
      </div>
    </>
  );
}
