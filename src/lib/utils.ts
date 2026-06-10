export const generateTurkishEnglishStr = (str: string) => {
    if (!str) return '';
    return String(str).toLowerCase()
        .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
        .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
        .replace(/İ/g, 'i').replace(/Ş/g, 's').replace(/Ğ/g, 'g')
        .replace(/Ü/g, 'u').replace(/Ö/g, 'o').replace(/Ç/g, 'c')
        .replace(/[^a-z0-9]/g, '');
};

export const generateCredentials = (fullName: string, studentNo?: string) => {
    if (!fullName) {
        return { username: 'user_' + Math.floor(Math.random() * 10000), password: Math.floor(100000 + Math.random() * 900000).toString() };
    }
    // If studentNo is embedded in fullName (e.g. "123 - Name"), extract it if not provided
    let pureName = String(fullName);
    let sn = studentNo;
    
    const match = fullName.match(/^(\d+)\s*[-]\s*(.+)$/);
    if (match) {
        sn = sn || match[1];
        pureName = match[2];
    }

    const baseName = generateTurkishEnglishStr(pureName) || 'user';
    const random4 = Math.floor(1000 + Math.random() * 9000);
    
    let username;
    if (sn) {
        username = `${baseName}${sn}`;
    } else {
        const random3 = Math.floor(100 + Math.random() * 900);
        username = `${baseName}${random3}`;
    }

    return {
        username,
        password: `${random4}`
    };
};

export const formatClassLabel = (cls: string) => {
    if (!cls) return '';
    return cls.replace('_', '');
};
