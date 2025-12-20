#!/usr/bin/env node

import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';

// ASCII Art Banner
const banner = `
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   ${chalk.cyan.bold('██╗  ██╗██╗   ██╗██████╗ ███████╗██████╗ ')}     ║
║   ${chalk.cyan.bold('██║  ██║╚██╗ ██╔╝██╔══██╗██╔════╝██╔══██╗')}    ║
║   ${chalk.cyan.bold('███████║ ╚████╔╝ ██████╔╝█████╗  ██████╔╝')}    ║
║   ${chalk.cyan.bold('██╔══██║  ╚██╔╝  ██╔═══╝ ██╔══╝  ██╔══██╗')}    ║
║   ${chalk.cyan.bold('██║  ██║   ██║   ██║     ███████╗██║  ██║')}    ║
║   ${chalk.cyan.bold('╚═╝  ╚═╝   ╚═╝   ╚═╝     ╚══════╝╚═╝  ╚═╝')}    ║
║                                                           ║
║          ${chalk.yellow.bold('KIT SDK - Multi-Chain Blockchain Tool')}        ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
`;

// Chain configurations
const chains = {
  layer1: {
    sui: {
      name: 'Sui',
      status: 'coming-soon',
      description: 'High-performance Layer 1 blockchain',
      color: chalk.blue
    },
    aptos: {
      name: 'Aptos',
      status: 'coming-soon',
      description: 'Scalable Layer 1 with Move language',
      color: chalk.green
    }
  },
  layer2: {
    metis: {
      name: 'Metis',
      status: 'active',
      description: 'Optimistic Rollup on Ethereum',
      color: chalk.cyan
    },
    mantle: {
      name: 'Mantle',
      status: 'coming-soon',
      description: 'Modular Layer 2 network',
      color: chalk.magenta
    }
  }
};

// Display welcome banner
function displayBanner() {
  console.clear();
  console.log(banner);
  console.log(chalk.gray('  Version 1.2.0\n'));
}

// Main menu
async function mainMenu() {
  const { layerChoice } = await inquirer.prompt([
    {
      type: 'list',
      name: 'layerChoice',
      message: chalk.bold('Select blockchain layer:'),
      choices: [
        {
          name: `Layer 1 ${chalk.gray('(Sui, Aptos)')}`,
          value: 'layer1'
        },
        {
          name: `Layer 2 ${chalk.gray('(Metis, Mantle)')}`,
          value: 'layer2'
        },
        new inquirer.Separator(),
        {
          name: chalk.red('Exit'),
          value: 'exit'
        }
      ]
    }
  ]);

  if (layerChoice === 'exit') {
    console.log(chalk.yellow('\n👋 Goodbye!\n'));
    process.exit(0);
  }

  return layerChoice;
}

// Chain selection menu
async function selectChain(layer) {
  const chainOptions = chains[layer];
  const choices = Object.entries(chainOptions).map(([key, chain]) => {
    const statusBadge = chain.status === 'active' 
      ? chalk.green('✓ ACTIVE')
      : chalk.yellow('⏳ COMING SOON');
    
    return {
      name: `${chain.color(chain.name.padEnd(10))} ${statusBadge.padEnd(20)} ${chalk.gray(chain.description)}`,
      value: key,
      disabled: chain.status === 'coming-soon' ? 'Not yet available' : false
    };
  });

  choices.push(new inquirer.Separator());
  choices.push({
    name: chalk.gray('← Back to main menu'),
    value: 'back'
  });

  const { chainChoice } = await inquirer.prompt([
    {
      type: 'list',
      name: 'chainChoice',
      message: chalk.bold(`Select ${layer === 'layer1' ? 'Layer 1' : 'Layer 2'} blockchain:`),
      choices,
      pageSize: 10
    }
  ]);

  return chainChoice;
}

// Initialize SDK for selected blockchain
async function initializeSDK(chainKey, chainName) {
  const spinner = ora({
    text: chalk.cyan('Generating SDK configuration...'),
    color: 'cyan'
  }).start();

  await new Promise(resolve => setTimeout(resolve, 1500));
  
  try {
    const { generateConfig } = await import('./utils/config-generator.js');
    const result = generateConfig(chainKey);
    
    spinner.succeed(chalk.green('SDK configured successfully!'));
    
    console.log('\n' + chalk.cyan('═'.repeat(60)));
    console.log(chalk.cyan.bold(`  ${chainName.toUpperCase()} SDK INITIALIZED`));
    console.log(chalk.cyan('═'.repeat(60)) + '\n');
    
    console.log(chalk.green('✓ Configuration files created:'));
    console.log(chalk.gray(`  • ${result.configPath}`));
    console.log(chalk.gray(`  • ${result.indexPath}`));
    console.log(chalk.gray(`  • ${result.examplePath}\n`));
    
    if (result.config.note) {
      console.log(chalk.yellow(`⚠️  ${result.config.note}\n`));
    }
    
    console.log(chalk.yellow('📦 Next steps:\n'));
    console.log(chalk.white('1. Install the SDK package:'));
    console.log(chalk.cyan('   npm install hyperionkit\n'));
    
    console.log(chalk.white('2. Import and use in your code:'));
    console.log(chalk.cyan('   import { Bridge, Swap, Staking, Faucet } from \'./src\';'));
    console.log(chalk.cyan('   // or'));
    console.log(chalk.cyan('   import { config } from \'./src\';\n'));
    
    console.log(chalk.white('3. Check example.js for usage examples\n'));
    
    if (result.config.contracts) {
      console.log(chalk.gray('Contract addresses:'));
      Object.entries(result.config.contracts).forEach(([name, address]) => {
        console.log(chalk.gray(`  ${name.padEnd(15)}: ${address}`));
      });
      console.log('');
    }
    
  } catch (error) {
    spinner.fail(chalk.red('Failed to generate configuration'));
    console.error(chalk.red('Error:'), error.message);
  }

  const { continueChoice } = await inquirer.prompt([
    {
      type: 'list',
      name: 'continueChoice',
      message: 'What would you like to do?',
      choices: [
        { name: 'Return to main menu', value: 'main' },
        { name: 'Exit', value: 'exit' }
      ]
    }
  ]);

  return continueChoice;
}

// Main application flow
async function main() {
  displayBanner();

  while (true) {
    const layer = await mainMenu();
    
    while (true) {
      const chain = await selectChain(layer);
      
      if (chain === 'back') {
        break;
      }

      const chainName = chains[layer][chain].name;
      const continueChoice = await initializeSDK(chain, chainName);
      
      if (continueChoice === 'exit') {
        console.log(chalk.yellow('\n👋 Goodbye!\n'));
        process.exit(0);
      } else if (continueChoice === 'main') {
        break;
      }
    }
  }
}

// Error handling
process.on('SIGINT', () => {
  console.log(chalk.yellow('\n\n👋 Goodbye!\n'));
  process.exit(0);
});

// Run the CLI
main().catch(error => {
  console.error(chalk.red('\n❌ Error:'), error.message);
  process.exit(1);
});
