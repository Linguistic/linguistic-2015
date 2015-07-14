all: dependencies quality static serve

clean:
	rm -rf public/css/*.css
	rm -rf public/js/*.js

dependencies:
	npm install

update_po:
	node_modules/.bin/extract-pot --locale locale .
	node_modules/i18n-abide/bin/merge-po.sh locale

compile_json:
	node_modules/i18n-abide/bin/compile-json locale locale

quality:
	gulp lint

js:
	cp -f node_modules/requirejs/require.js public/js
	node_modules/.bin/r.js -o build.js

css:
	gulp styles

static: clean js css

serve:
	node app/server.js
