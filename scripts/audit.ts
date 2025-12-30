import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

/**
 * Pre-commit audit script
 * Runs before git commit to ensure code quality and security
 */

interface AuditResult
{
    passed: boolean;
    errors: string[];
    warnings: string[];
}

class PreCommitAudit
{
    private results: AuditResult = {
        passed: true,
        errors: [],
        warnings: [],
    };

    /**
     * Run TypeScript type checking
     */
    private checkTypeScript(): void
    {
        console.log('🔍 Checking TypeScript types...');
        try
        {
            execSync('npx tsc --noEmit', { stdio: 'inherit' });
            console.log('✅ TypeScript check passed\n');
        } catch (error)
        {
            this.results.passed = false;
            this.results.errors.push('TypeScript type checking failed');
            console.error('❌ TypeScript check failed\n');
        }
    }

    /**
     * Run ESLint
     */
    private runLinter(): void
    {
        console.log('🔍 Running ESLint...');
        try
        {
            execSync('npm run lint', { stdio: 'inherit' });
            console.log('✅ ESLint check passed\n');
        } catch (error)
        {
            this.results.passed = false;
            this.results.errors.push('ESLint check failed');
            console.error('❌ ESLint check failed\n');
        }
    }

    /**
     * Run tests
     */
    private runTests(): void
    {
        console.log('🔍 Running tests...');
        try
        {
            execSync('npm test', { stdio: 'inherit' });
            console.log('✅ Tests passed\n');
        } catch (error)
        {
            this.results.passed = false;
            this.results.errors.push('Tests failed');
            console.error('❌ Tests failed\n');
        }
    }

    /**
     * Check for sensitive data
     */
    private checkSensitiveData(): void
    {
        console.log('🔍 Checking for sensitive data...');
        const sensitivePatterns = [
            /password\s*=\s*['"][^'"]+['"]/gi,
            /api[_-]?key\s*=\s*['"][^'"]+['"]/gi,
            /secret\s*=\s*['"][^'"]+['"]/gi,
            /token\s*=\s*['"][^'"]+['"]/gi,
        ];

        const stagedFiles = execSync('git diff --cached --name-only', { encoding: 'utf-8' })
            .split('\n')
            .filter((file) => file.endsWith('.ts') || file.endsWith('.js'));

        let foundSensitiveData = false;

        for (const file of stagedFiles)
        {
            if (!fs.existsSync(file)) continue;

            const content = fs.readFileSync(file, 'utf-8');

            for (const pattern of sensitivePatterns)
            {
                if (pattern.test(content))
                {
                    foundSensitiveData = true;
                    this.results.warnings.push(`Possible sensitive data found in ${ file }`);
                }
            }
        }

        if (foundSensitiveData)
        {
            console.warn('⚠️  Warning: Possible sensitive data detected\n');
        } else
        {
            console.log('✅ No sensitive data detected\n');
        }
    }

    /**
     * Check for TODO/FIXME comments
     */
    private checkTodoComments(): void
    {
        console.log('🔍 Checking for TODO/FIXME comments...');
        const stagedFiles = execSync('git diff --cached --name-only', { encoding: 'utf-8' })
            .split('\n')
            .filter((file) => file.endsWith('.ts') || file.endsWith('.js'));

        let todoCount = 0;

        for (const file of stagedFiles)
        {
            if (!fs.existsSync(file)) continue;

            const content = fs.readFileSync(file, 'utf-8');
            const lines = content.split('\n');

            lines.forEach((line, index) =>
            {
                if (line.includes('TODO') || line.includes('FIXME'))
                {
                    todoCount++;
                    this.results.warnings.push(`${ file }:${ index + 1 } - ${ line.trim() }`);
                }
            });
        }

        if (todoCount > 0)
        {
            console.warn(`⚠️  Found ${ todoCount } TODO/FIXME comments\n`);
        } else
        {
            console.log('✅ No TODO/FIXME comments found\n');
        }
    }

    /**
     * Check package.json for vulnerabilities
     */
    private checkDependencies(): void
    {
        console.log('🔍 Checking dependencies for vulnerabilities...');
        try
        {
            execSync('npm audit --audit-level=moderate', { stdio: 'inherit' });
            console.log('✅ No vulnerabilities found\n');
        } catch (error)
        {
            this.results.warnings.push('Vulnerabilities found in dependencies');
            console.warn('⚠️  Vulnerabilities detected in dependencies\n');
        }
    }

    /**
     * Run all audits
     */
    public async run(): Promise<void>
    {
        console.log('\n╔═══════════════════════════════════════════════════════╗');
        console.log('║                                                       ║');
        console.log('║              🔒 PRE-COMMIT AUDIT                      ║');
        console.log('║                                                       ║');
        console.log('╚═══════════════════════════════════════════════════════╝\n');

        // Run all checks
        this.checkTypeScript();
        this.runLinter();
        // this.runTests(); // Uncomment if you want to run tests on every commit
        this.checkSensitiveData();
        this.checkTodoComments();
        this.checkDependencies();

        // Print summary
        console.log('\n╔═══════════════════════════════════════════════════════╗');
        console.log('║                  AUDIT SUMMARY                        ║');
        console.log('╚═══════════════════════════════════════════════════════╝\n');

        if (this.results.errors.length > 0)
        {
            console.error('❌ ERRORS:');
            this.results.errors.forEach((error) => console.error(`   - ${ error }`));
            console.log('');
        }

        if (this.results.warnings.length > 0)
        {
            console.warn('⚠️  WARNINGS:');
            this.results.warnings.forEach((warning) => console.warn(`   - ${ warning }`));
            console.log('');
        }

        if (this.results.passed)
        {
            console.log('✅ All checks passed! Proceeding with commit...\n');
            process.exit(0);
        } else
        {
            console.error('❌ Audit failed! Please fix the errors before committing.\n');
            process.exit(1);
        }
    }
}

// Run audit
const audit = new PreCommitAudit();
audit.run();
