import { useSelector } from "react-redux";

export default function CharacterPreview() {

  const state = useSelector(s => s);
  const power =
      state.stats.strength +
      state.stats.intelligence +
      state.stats.agility;

  return (
    <>
      <h2>Aperçu du personnage</h2>

      <p>Nom : {state.name}</p>
      <p>Classe : {state.class}</p>

      <p>Force : {state.stats.strength}</p>
      <p>Intelligence : {state.stats.intelligence}</p>
      <p>Agilité : {state.stats.agility}</p>

      <h3>Puissance : {power}</h3>
    </>
  );
}
