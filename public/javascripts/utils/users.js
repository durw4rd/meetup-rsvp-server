const users = [
    {
        name: 'Michal',
        cookies: "MEETUP_BROWSER_ID=id=e9bccd81-b7dc-46e8-b2d5-7a0d7f00bb53; _rm=a9148160-2704-4cfe-9e1f-667ae6ea2104; MEETUP_TRACK=id=0f693824-485a-493e-8b4d-ceb33c2afad9&l=1&s=c127c5f5989d32f52365fb11a95a1e3188b4d58a; _gcl_au=1.1.1071325647.1676103518; cjConsent=MHxZfDB8Tnww; memberId=198134199; MEETUP_SESSION=bf916e6f-907c-475c-a575-e4d6592aee19; MEETUP_MEMBER=id=198134199&status=1&timestamp=1676103522&bs=0&tz=Europe%2FAmsterdam&zip=meetup1&country=nl&city=Amsterdam&state=&lat=52.37&lon=4.89&ql=false&s=281b0e5696fde5e454c23e37e3dddd992900d2b2&scope=ALL; SIFT_SESSION_ID=aa21f277-8b5d-4b74-80b8-581cafd16b24; MEETUP_CSRF=5afe4878-6a19-4d8b-868d-8bf797993b8b; _uetsid=86551880aac811eda6a0aba612a8b617; _uetvid=df0014d060d111edbea75356f6f2a85f; RoktRecogniser=e509a5ff-89e5-40b5-a4ac-1740ae28b4c2; MEETUP_SEGMENT=member; __Host-NEXT_MEETUP_CSRF=cc83d9a0-6800-4ae7-b85a-19c4495d579c; x-mwp-csrf=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1dWlkIjoiZjE2ZGQ0NTUtOTY0My00NTk5LWJmOTYtZmJjZGFiMTgwZTFlIiwidHlwZSI6ImNvb2tpZSIsImlhdCI6MTY3NjIwNTAyN30.KAxl0_Em8XG4wGWi7bzn32UsrCUuADUIywZJdY7utTg; x-mwp-csrf-header=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1dWlkIjoiZjE2ZGQ0NTUtOTY0My00NTk5LWJmOTYtZmJjZGFiMTgwZTFlIiwidHlwZSI6ImhlYWRlciIsImlhdCI6MTY3NjIwNTAyN30.-WpbFbM1-zzF4xa-7MmGj22_r7bmMKx2JI1al99BExo",
        sha256Hash: "caeae323505e7f544fb3aa0ca3ea8398c342ab0504143ed9b49af85cfd8b4c38"
    },
    {
        name: 'Andreas',
        cookies: "MEETUP_BROWSER_ID=id=2ef898e4-6c91-4ccd-993a-979346ddffa3; SIFT_SESSION_ID=7d667be6-07f5-4ead-b371-e1b01fc22c71; _rm=23a731cd-2490-4edd-aeba-c8fe269e19f2; memberId=199147248; MEETUP_SESSION=b1ab918e-06f8-4588-81c3-a267b8081578; MEETUP_MEMBER=id=199147248&status=1&timestamp=1679328992&bs=0&tz=Europe%2FAmsterdam&zip=meetup1&country=nl&city=Amsterdam&state=&lat=52.37&lon=4.89&ql=false&s=574d484d11ab77db8519b7c884169e76a7217be9&scope=ALL&rem=1; MEETUP_LANGUAGE=language=en&country=US; MEETUP_CSRF=2c6f74bf-a001-4514-b08c-8d54c206bde0; ___uLangPref=en_US; MEETUP_TRACK=id=34c30d5c-b5ee-4f3f-9a1c-ce86f25c8b02&l=1&s=0ed21440435a44a914a800834b067aed9e44086a; MEETUP_SEGMENT=member; x-mwp-csrf=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1dWlkIjoiNTJkNzhhM2UtZjBlZC00NTFkLWE5MWMtOWUxMDFkNzlhMDExIiwidHlwZSI6ImNvb2tpZSIsImlhdCI6MTY3OTMyOTA0Mn0.jndRpLcGJsmu7k_aDCMjusLm0JDBOyPPBQ3vdOaMVs8; x-mwp-csrf-header=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1dWlkIjoiNTJkNzhhM2UtZjBlZC00NTFkLWE5MWMtOWUxMDFkNzlhMDExIiwidHlwZSI6ImhlYWRlciIsImlhdCI6MTY3OTMyOTA0Mn0.v5HC5kbg4EZX3sZGXi5gA9fz9-2QyfMYZiZEuHiGYAk;",
        sha256Hash: "caeae323505e7f544fb3aa0ca3ea8398c342ab0504143ed9b49af85cfd8b4c38"
    }
]

const listUserNames = () => {
    const userNames = users.map((user) => {
        return user.name;
    })
    return userNames;
}

const getUserByName = (userName) => {    
    return users.find(({ name }) => name === userName);
}

module.exports = { listUserNames, getUserByName };