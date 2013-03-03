Code for running DataCatalogs.org.

[Overview and plans for DataCatalogs.org as of Feb 2013](https://docs.google.com/a/okfn.org/document/d/1MP1eaxUPir9msLt4rRwYqdupE3-qeLZAqFXRiXuvwkA/edit)

## Developer Instructions

1. Clone this repo
2. Run the following commands to pull in the CKAN Javascript library:

        git submodule init
        git submodule update

2. Open index.html in your web browser
3. Change config options such as:

  * the location of the backing CKAN instance (default is datahub.io)
  * Filters (e.g. only show datasets from group or groups X)
  * Set your logo ...

4. Theme your site and tweak the templates
5. Deploy using github pages or your own static site
