A community-driven catalog of Open Data Portals around the world.

[![Portals](https://github.com/okfn/dataportals.org/actions/workflows/frictionless.yaml/badge.svg)](https://repository.frictionlessdata.io/pages/dashboard.html?user=okfn&repo=dataportals.org&flow=portals)

This repository contains the [data](data/README.md) as well as the code
for the DataPortals.org website.

## History

[The original plans for DataCatalogs.org - Feb 2013](https://docs.google.com/a/okfn.org/document/d/1MP1eaxUPir9msLt4rRwYqdupE3-qeLZAqFXRiXuvwkA/edit).
Other ideas may be listed as Issues in this repository.

## Community

You can discuss with the community any ideas on how to improve the
project or otherwise share your thoughts. Conversations with the Open
Knowledge community are held in the
[discussion forum](https://discuss.okfn.org/c/open-knowledge-labs/dataportals). 

### Contributing to the catalogue

You can contribute additions or corrections to the data portal list by
opening a new issue in the repository. Please check the
[list of outstanding issues](https://github.com/okfn/dataportals.org/issues)
first to see if your suggestion or change is already listed there to
avoid duplicates.

If you can, submitting a pull request to changet the
[data.csv](https://github.com/okfn/dataportals.org/blob/master/data/portals.csv)
file would be even better. See the
[datapackage.json](https://github.com/okfn/dataportals.org/blob/master/data/datapackage.json)
file to find out the structure of the csv and the meaning of each column.

### Developing the website

This app requires NodeJS (>= v9.11).

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
    npm start
    ```

Then point your browser at http://localhost:8080/

#### Deployment

We deploy by default to Heroku. The app is currently configured to deploy on each push to master.
