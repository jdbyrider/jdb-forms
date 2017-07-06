module.exports = function(grunt) {
	
	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		browserify: {
			'./js/bundle.js': ['./js/jdb-form.js']
		},		
		uglify: {
			options: {
				banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
			},
			build: {
				src: 'js/bundle.js',
				dest: 'dist/js/bundle.min.js'
			}
		},
		cssmin: {
			target: {
				files: [{
					expand: true,
					cwd: './css/',
					src: ['*.css', '!*.min.css'],
					dest: './css/',
					ext: '.min.css'
				}],
				files: [{
					expand: true,
					cwd: './css/',
					src: ['*.css', '!*.min.css'],
					dest: './dist/css',
					ext: '.min.css'
				}],
			}
		},
		copy: {
			main: {
				files: [
					{
						nonull: true,
						src: './discover-post.php',
						dest: './dist/',
					},
					{
						nonull: true,
						src: './Environment.ini',
						dest: './dist/',
					},
					{
						nonull: true,
						src: './environment-settings.php',
						dest: './dist/',
					},
					{
						nonull: true,
						src: './index.html',
						dest: './dist/',
					},
					{
						nonull: true,
						src: './favicon.ico',
						dest: './dist/',
					},
					{						
						src: ['assets/*'],
						dest: './dist/',
					},
					{						
						src: ['fonts/*'],
						dest: './dist/',
					},
				],
			},
		}
	});
	
	// Load the plugin that provides the "uglify" task.
	grunt.loadNpmTasks('grunt-browserify');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	// Default task(s).
	grunt.registerTask('default', ['browserify', 'uglify', 'cssmin', 'copy']);
	
};