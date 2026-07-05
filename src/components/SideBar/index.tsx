import Item from "./Item";
import NoteList from "../NoteList";
import UserItem from "./UserItem";
import { FiPlus, FiSearch } from "react-icons/fi";
import { useNoteStore } from "../../modules/notes/note.state";
import { noteRepository } from "../../modules/notes/note.repository";
import { useNavigate } from "react-router-dom";

type Props = {
  onSearchButtonClick: () => void;
};

export default function SideBar({ onSearchButtonClick }: Props) {
  const noteStore = useNoteStore();
  const navigate = useNavigate();

  const handleCreateNote = async () => {
    try {
      const newNote = await noteRepository.create({});
      noteStore.set([newNote]);
      navigate(`/notes/${newNote.id}`);
    } catch (err) {
      console.error("createNote Err", err);
      alert("ノートの作成に失敗しました");
    }
  };

  return (
    <>
      <aside className="sidebar">
        <div>
          <div>
            <UserItem />
            <Item label="検索" icon={FiSearch} onClick={onSearchButtonClick} />
          </div>
          <div className="sidebar-spacer">
            <NoteList />
            <Item
              label="ノートを作成"
              icon={FiPlus}
              onClick={handleCreateNote}
            />
          </div>
        </div>
      </aside>
      <div className="sidebar-placeholder"></div>
    </>
  );
}
