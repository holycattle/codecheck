# codecheck
- Run several kind of test framework by one command.
- Launch web server before run end to end test.
- CLI client of code-check.io.

## Getting started
Install from npm.

```
npm install codecheck -g
```

You can run any test framework like this

```
codecheck mocha
codecheck mocha specs/test --recursive
codecheck sbt
```

If the file `codecheck.yml` exists in project root directory, codecheck runs according to it.

## How to run with web server
Define web server information in codecheck.yml.
Like this

```
web:
  command: sbt run
  port: 9000
  console: true
  dir: app
```

## codecheck.yml
codecheck.yml is a setting file of codecheck CLI.  
If this file is exist in current directory, its settings are used to run.

It can have following keys

### build
Array.  
If this section has some commands, run these commands sequencially before run test.

### environment
Hash.  
You can pass some environment variable to test.

### web
Web application information. 

If defined, launch web app and wait to be ready by polling testUrl.

It has following sub keys.

- command: required. starting command of web app.
- port: required. port of web app
- console: option. if true, console output of web app is displayed.
- dir: option. base directory of web app.
- testUrl: option. the url which is used in start check.(Default `/`)

### test
Test command.  
If defined, it is used as default test command.  
So, you can run codecheck without any parameters.

```
codecheck
```

### config
Other configurations.  
It has following sub keys.

- timeout: Timeout to wait finishing all tests.

## Work with code-check.io
Also, codecheck is a command line client of [code-check.io](https://code-check.io)

If you are the user of code-check, you can download its challenge result like git.

### codecheck clone
Downloads all of challenge result source files into your local environment.
(You have to have code-check account and permission for specified challenge result.)

```
codecheck clone 87
```

If you are the member of any organization, you can download all of specified exam result with `--exam` option.

```
codecheck clone 2 --exam
```

### codecheck pull
Once you have cloned challenge/exam in local environment, you can update it with clone command.

```
codecheck clone 87
cd user1-87
codecheck pull
```


### codecheck pull
You can download specified challenge result with clone/pull command. (If you have a permission for it.)

```
codecheck clone 87
cd user1-87
```