import SideBar from "./components/SideBar";
import SearchModal from "./components/SearchModal";
import "./styles/layout.css";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { useAtomValue } from "jotai";
import { currentUserAtom } from "./modules/auth/currentUser.state";
import { useEffect, useState } from "react";
import { useNoteStore } from "./modules/notes/note.state";
import { noteRepository } from "./modules/notes/note.repository";
import { Note } from "./modules/notes/note.entity";

export default function Layout() {
  const currentUser = useAtomValue(currentUserAtom);
  const [isLoading, setIsLoading] = useState(true);
  const noteStore = useNoteStore();
  const [isShowModal, setIsShowModal] = useState(false);
  const [searchResult, setSearchResult] = useState<Note[]>([]);
  const navigate = useNavigate();

  const fetchNotes = async () => {
    try {
      const notes = await noteRepository.find();
      noteStore.set(notes);
    } catch (err) {
      console.error("fetchNotes Err", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleSearchNotes = async (keyword: string) => {
    const notes = await noteRepository.find({ keyword });
    noteStore.set(notes);
    setSearchResult(notes ?? []);
  };

  const handleMoveToDetail = (noteId: number) => {
    navigate(`/notes/${noteId}`)
    setIsShowModal(false)
  }

  if (!currentUser) return <Navigate to="/signin" replace />;
  return (
    <div className="layout-container">
      {!isLoading && (
        <SideBar onSearchButtonClick={() => setIsShowModal(true)} />
      )}
      <main className="layout-main">
        <Outlet />
      </main>
      <SearchModal
        isOpen={isShowModal}
        onClose={() => setIsShowModal(false)}
        notes={searchResult}
        onKeywordChange={handleSearchNotes}
        onItemSelect={handleMoveToDetail}
      />
    </div>
  );
}
