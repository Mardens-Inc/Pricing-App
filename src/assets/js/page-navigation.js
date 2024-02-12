import DatabaseList from "./database-list.js";
import DirectoryList from "./directory-list.js";


const directory = new DirectoryList();
$(directory).on("loadExternalView", (event, id) => {
    const database = new DatabaseList(id);
});