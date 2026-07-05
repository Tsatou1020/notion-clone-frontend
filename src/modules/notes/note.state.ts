import { atom, useAtom } from "jotai";
import { Note } from "./note.entity";

const notesAtom = atom<Note[]>([]);

export const useNoteStore = () => {
  const [notes, setNotes] = useAtom(notesAtom);
  const getAll = () => notes;
  const getOne = (id: number) => notes.find((note) => note.id === id);
  const set = (newNotes: Note[]) => {
    setNotes((oldNotes) => {
      const combineNotes = [...oldNotes, ...newNotes];
      const uniqueNotes: { [key: number]: Note } = {};

      for (const note of combineNotes) {
        uniqueNotes[note.id] = note;
      }

      // Object.values()は、JavaScriptオブジェクトの「値（value）」だけを抽出して配列として返す静的メソッド
      // 「重複チェックのために一時的にオブジェクト形式にしたデータを、本来の正しい形（配列）に整えてから、保存（return）するため」の仕上げの作業コード
      return Object.values(uniqueNotes);
    });
  };
  const deleteNote = (id: number) => {
    const findChildrenIds = (parentId: number): number[] => {
      const childrenIds = notes
        .filter((note) => note.parentId == parentId)
        .map((child) => child.id);
      // concatは配列・文字列の結合のために使用
      return childrenIds.concat(
        ...childrenIds.map((childId) => findChildrenIds(childId)),
      );
    };

    const childrenIds = findChildrenIds(id);
    setNotes((oldNotes) =>
      // [...childrenIds, id] は 削除対象IDのリスト作成
      // .includes(note.id)で指定したIDが含まれているかをチェック
      // oldNotes.filter((note) => !～ は、全ノートの中から削除対象IDが含まれないものだけ返す
      oldNotes.filter((note) => ![...childrenIds, id].includes(note.id)),
    );
  };

  const clear = () => {
    setNotes([]);
  };

  return { getAll, getOne, set, delete: deleteNote, clear };
};
