//
export class FileUploadUI {
    constructor(handleContents) {
        this._handleContents = handleContents;
        this._events();
    }
    _events() {
        document.getElementById('import').addEventListener('change', e => this._handle_file_select(e), false);
    }
    _handle_file_select(evt) {
        console.info("[Event] file chooser");

        let fl_files = evt.target.files; // JS FileList object


        // use the 1st file from the list
        let fl_file = fl_files[0];

        let reader = new FileReader(); // built in API

        let display_file = (e) => {
            console.info('. . got: ', e.target.result.length, e);
            this._handleContents(e.target.name, e.target.result);
        };

        let on_reader_load = (fl) => {
            console.info('. file reader load', fl);
            if (fl.name)
                return display_file; // a function
        };

        // Closure to capture the file information.
        reader.onload = on_reader_load(fl_file);

        // Read the file as text.
        reader.readAsText(fl_file);
    }
}
