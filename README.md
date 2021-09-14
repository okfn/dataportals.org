Code for running DataPortals.org.

[The original plans for DataCatalogs.org - Feb 2013](https://docs.google.com/a/okfn.org/document/d/1MP1eaxUPir9msLt4rRwYqdupE3-qeLZAqFXRiXuvwkA/edit).
Other ideas may be listed as Issues in this repository.
Conversations with the Open Knowledge community are held in the
[discussion forum](https://discuss.okfn.org/c/open-knowledge-labs/dataportals).  

You can contribute additions or corrections to the data portal list by
suggesting changes to the
[data.csv](https://github.com/okfn/dataportals.org/blob/master/data/portals.csv)
file. See the
[datapackage.json](https://github.com/okfn/dataportals.org/blob/master/data/datapackage.json)
for the meaning of each column.

## Developer Instructions

This app requires NodeJS (>= v0.8).

1. Clone this repo:

    ```bash
    git clone --recursive git@github.com:okfn/dataportals.org.git
    ```
    You need to use `--recursive` because this repository uses Recline as a
    [git submodule](https://github.blog/2016-02-01-working-with-submodules/#joining-a-project-using-submodules).

2. Install the dependencies:

    ```bash
        npm install .
    ```

3. Try it out locally:

    ```bash
        node app.js
    ```

   Then point your browser at http://localhost:5000/


## Deployment

We deploy by default to Heroku. The app is currently configured to deploy on each push to master.
