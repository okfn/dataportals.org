The Catalog Assembly Kit is a simple toolkit for creating a Data Catalog backed
by an existing CKAN instance (usually the DataHub.io) easily and quickly using
pure Javascript and HTML.

The Catalog Assembly Kit runs as an application on top of a CKAN instance. All
data is stored in the backing CKAN instance and your site and search are driven
directly from its API.

## Instructions

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

