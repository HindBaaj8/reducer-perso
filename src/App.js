import Header from "./Components/Header";
import CharacterName from "./Components/CharacterName";
import ClassSelector from "./Components/ClassSelector";
import StatsEditor from "./Components/StatsEditor";
import CharacterPreview from "./Components/CharacterPreview ";

export default function App() {
  return (
    <div>
      <Header />
      <CharacterName />
      <ClassSelector />
      <StatsEditor />
      <CharacterPreview />
    </div>
  );
}
