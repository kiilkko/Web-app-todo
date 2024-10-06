import { PlusIcon, TrashIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs"; // Библиотека для форматирования дат

function App() {
  const [todos, setTodos] = useState([]);
  const [name, setName] = useState("");
  const [editStatus, setEditStatus] = useState(false);
  const [editName, setEditName] = useState("");
  const [editTodo, setEditTodo] = useState({});
  const [openEditUI, setOpenEditUI] = useState(false);

  // Добавление новой задачи
  const addTodoHandler = () => {
    const postTodo = async () => {
      const postTododata = {
        name: name,
        status: false,  // По умолчанию статус Pending
      };
      const { data } = await axios.post(
        "http://127.0.0.1:8000/todos/",
        postTododata
      );
      setTodos([...todos, data]);
      setName("");
    };
    postTodo();
  };

  // Обновление задачи
  const editTodoHandler = (id) => {
    const updatePatchTodo = async () => {
      const updateData = {
        name: editName,
        status: editStatus,
      };
      const { data } = await axios.patch(`http://127.0.0.1:8000/todos/${id}/`, updateData);
      const updatedTodos = todos.map((todo) => {
        if (todo.id === id) {
          todo.name = editName;
          todo.status = editStatus;
        }
        return todo;
      });
      setTodos(updatedTodos);
      setEditTodo({});
      setEditName('');
      setEditStatus(false);
      setOpenEditUI(false);
    };
    updatePatchTodo();
  };

  // Удаление задачи
  const deleteTodoHandler = (id) => {
    const deleteTodo = async () => {
      await axios.delete(`http://127.0.0.1:8000/todos/${id}/`);
      const newTodos = todos.filter((todo) => todo.id !== id);
      setTodos(newTodos);
    };
    deleteTodo();
  };

  // Получение всех задач
  useEffect(() => {
    const fetchTodos = async () => {
      const { data } = await axios.get("http://127.0.0.1:8000/todos/");
      setTodos(data);
    };
    fetchTodos();
  }, []);

  return (
    <div className="bg-[#2C3531] text-white h-screen relative">
      <div className="flex flex-col w-full p-10">
        <h1 className="text-5xl text-center pb-5 text-white">Todo</h1>
        <div className="flex items-center justify-between bg-[#116466] rounded-xl px-4">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            type="text"
            className="w-full py-2 rounded-xl bg-[#116466] text-white outline-none"
            placeholder="Добавь задачу сюда..."
          />
          <i onClick={addTodoHandler}>
            <PlusIcon className="icons hover:opacity-70" />
          </i>
        </div>

        <div className="mt-5 flex flex-col space-y-5 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-10 lg:grid-cols-3">
          {todos?.map((todo) => (
            <div
              key={todo.id}
              className="max-w-md mx-auto w-full p-5 h-full rounded-xl bg-[#116466] flex items-center justify-between"
            >
              <div className="flex items-center">
                {/* Чекбокс для изменения статуса */}
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={todo.status}
                  onChange={async () => {
                    const updatedTodo = {
                      ...todo,
                      status: !todo.status,
                    };
                    await axios.patch(`http://127.0.0.1:8000/todos/${todo.id}/`, updatedTodo);
                    const updatedTodos = todos.map((t) =>
                      t.id === todo.id ? updatedTodo : t
                    );
                    setTodos(updatedTodos);
                  }}
                />
                {/* Дата создания задачи */}
                <p className="text-gray-300 mr-2">
                  {dayjs(todo.created_at).format("DD/MM/YYYY")}
                </p>
                <p
                  onClick={() => {
                    setEditStatus(todo.status);
                    setEditName(todo.name);
                    setEditTodo(todo);
                    setOpenEditUI(true);
                  }}
                  className="cursor-pointer"
                >
                  {todo.name}{" "}
                  <span className="text-xs text-gray-300">
                    ({todo.status ? "Завершена!" : "Ожидает..."})
                  </span>
                </p>
              </div>

              <i onClick={() => deleteTodoHandler(todo.id)}>
                <TrashIcon className="icons" fill="white" />
              </i>
            </div>
          ))}
        </div>
      </div>

      {/* Модальное окно для редактирования */}
      <div
        className={`w-72 h-fit bg-white text-slate-900 absolute left-1/2 rounded-xl px-3 py-2 -translate-x-1/2 -translate-y-1/2 ${
          openEditUI ? "" : "hidden"
        }`}
      >
        <div className="flex items justify-between">
          <h1 className="text-xl mb-2">Edit Todos</h1>
          <i onClick={() => setOpenEditUI(false)}>
            <XMarkIcon className="icons" />
          </i>
        </div>
        <div className="flex items-center h-5 w-full space-x-2 mb-4">
          <input
            type="checkbox"
            className="h-5 w-5"
            checked={editStatus}
            onChange={() => setEditStatus(!editStatus)}
          />{" "}
          <i>Status</i>
        </div>

        <div>
          <input
            type="text"
            className="w-full px-3 py-2 bg-gray-300 rounded-xl"
            placeholder="Edit Name.."
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
          />
        </div>
        <button
          onClick={() => editTodoHandler(editTodo.id)}
          className="w-full p-2 rounded-xl bg-slate-700 text-white mt-2"
        >
          Update
        </button>
      </div>
    </div>
  );
}

export default App;

