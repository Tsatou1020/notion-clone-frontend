import type React from "react";
import { useNoteStore } from "../../modules/notes/note.state";
import NoteItem from "./NoteItem";
import { noteRepository } from "../../modules/notes/note.repository";
import type { Note } from "../../modules/notes/note.entity";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface Props {
  layer?: number;
  parentId?: number;
}

export default function NoteList({ layer = 0, parentId }: Props) {
  const noteStore = useNoteStore();
  const notes = noteStore.getAll();
  const [expanded, setExpanded] = useState<Map<number, boolean>>(new Map());
  const navigate = useNavigate();

  const handleCreateChild = async (e: React.MouseEvent, parentId: number) => {
    e.preventDefault();
    const newNote = await noteRepository.create({ parentId });
    noteStore.set([newNote]);
    setExpanded((prev) => {
      const newExpanded = new Map(prev);
      newExpanded.set(parentId, true);
      return newExpanded;
    });
    handleMoveToDetail(newNote.id);
  };

  const handleFetchChildren = async (e: React.MouseEvent, note: Note) => {
    e.preventDefault();
    const children = await noteRepository.find({ parentId: note.id });
    if (!children) return;
    noteStore.set(children);
    setExpanded((prev) => {
      const newExpanded = new Map(prev);
      newExpanded.set(note.id, !prev.get(note.id));
      return newExpanded;
    });
  };

  const handleDeleteNote = async (e: React.MouseEvent, noteId: number) => {
    e.preventDefault();
    const deleteNoteConfirm = window.confirm("指定のノートを削除しますか？");
    if (!deleteNoteConfirm) return;

    try {
      await noteRepository.delete(noteId);
      noteStore.delete(noteId);
      navigate("/");
    } catch (err) {
      console.error("deleteNote Err", err);
      alert("ノートの削除に失敗しました");
    }
  };

  const handleMoveToDetail = (noteId: number) => {
    navigate(`/notes/${noteId}`);
  };

  return (
    <>
      {notes
        .filter((note) => parentId == note.parentId)
        .map((note) => {
          return (
            <div key={note.id}>
              <NoteItem
                note={note}
                onCreate={(e) => {
                  handleCreateChild(e, note.id);
                }}
                onExpand={(e) => handleFetchChildren(e, note)}
                layer={layer}
                expanded={expanded.get(note.id)}
                onClick={() => handleMoveToDetail(note.id)}
                onDelete={(e) => handleDeleteNote(e, note.id)}
              />
              {expanded.get(note.id) && (
                <NoteList layer={layer + 1} parentId={note.id} />
              )}
            </div>
          );
        })}
    </>
  );
}
