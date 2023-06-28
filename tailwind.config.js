module.exports = {
    content: ['./src/**/*.html'],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#005b99',
                    dark: '#00375c'
                }
            }
        },
        listStyleType: {
            none: 'none',
            disc: 'disc',
            decimal: 'decimal',
            square: 'square',
            roman: 'upper-roman'
        }
    },
    variants: {
        extend: {}
    },
    plugins: []
};
