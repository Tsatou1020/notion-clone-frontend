import { useParams } from "react-router-dom";
import TitleInput from "../components/TitleInput";
import "../styles/pages/note-detail.css";
import { useEffect, useState } from "react";
import { useNoteStore } from "../modules/notes/note.state";
import { noteRepository } from "../modules/notes/note.repository";
import { Editor } from "../components/Editor";
import { useDebouncedCallback } from "use-debounce";

export default function NoteDetail() {
  const [isLoading, setIsLoading] = useState(true);
  const params = useParams();
  const id = parseInt(params.id!);
  const noteStore = useNoteStore();
  const note = noteStore.getOne(id);

  useEffect(() => {
    const fetchOne = async () => {
      try {
        // 最新のデータをサーバーから取得してStore（フロント側で管理）を更新
        const note = await noteRepository.findOne(id);
        noteStore.set([note]);
      } catch (err) {
        console.error("fetchOne err", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOne();
  }, [id]);

  const handleUpdateNote = async (
    id: number,
    note: { title?: string; content?: string },
  ) => {
    const updatedNote = await noteRepository.update(id, note);
    noteStore.set([updatedNote]);
    return updatedNote;
  };

  const debounced = useDebouncedCallback(handleUpdateNote, 500);

  if (isLoading) return <div />;
  if (!note) return <div>note is not existed</div>;

  return (
    <div className="note-detail-container">
      <div className="note-detail-content">
        {/* Reactは key が変わると、「古いコンポーネントを破棄して、
        新しいコンポーネントを一からマウントし直す」という挙動をするためpropsとしてkeyも指定
        （ページが切り替わった際にTitleInputを再レンダリングさせるため） */}
        <div key={note.id}>
          <TitleInput
            initialData={note}
            onTitleChange={(title) => debounced(id, { title })}
          />
          <Editor
            initialContent={note.content}
            onChange={(content) => debounced(id, { content })}
          />
        </div>
      </div>
    </div>
  );
}
