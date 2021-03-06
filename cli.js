#!/usr/bin/env node

/**
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

const ora = require('ora');
const {
  getPackageEcmaVersion,
  isEcmaVersionModern,
} = require('./src/index.js');

async function main(packageString) {
  const spinner = ora({ stream: process.stdout });
  spinner.text = `Fetching ${packageString}`;
  spinner.start();
  try {
    const ecmaVersion = await getPackageEcmaVersion(packageString);
    if (isEcmaVersionModern(ecmaVersion)) {
      spinner.succeed(`${packageString} is modern (ES${ecmaVersion})!`);
    } else {
      spinner.warn(`${packageString} is legacy (ES${ecmaVersion}).`);
    }
    process.exit(0);
  } catch (e) {
    spinner.fail(`Unable to fetch the package ${packageString}. ${e.message}`);
    process.exit(1);
  }
}

const packageString = process.argv[2];
main(packageString);
