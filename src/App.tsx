import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import axios from 'axios';
interface User {
  firstName: string;
  lastName: string;
  gender: string;
  age: number;
  hair: Hair;
  address: {
    postalCode: string;
  };
  company: Company;
}

interface Company {
  department: string
}

interface Hair {
  color: string
}

interface GroupedData {
  [key: string]: {
    male: number;
    female: number;
    ageRange: string;
    ageMode: number;
    hair: {
      [key: string]: number;
    };
    addressUser: {
      [key: string]: string;
    };
  };
}

function App() {
  const [groupedData, setGroupedData] = useState<GroupedData>({});

  useEffect(() => {
    axios.get('https://dummyjson.com/users')
      .then(response => {
        // group data by department
        const grouped = response.data.users.reduce((acc: GroupedData, user: User) => {
          const { firstName, lastName, gender, age, hair, address, company } = user;
          // initialize department data if it doesn't exist yet
          if (!acc[company.department]) {
            acc[company.department] = {
              male: 0,
              female: 0,
              ageRange: '',
              ageMode: 0,
              hair: {},
              addressUser: {}
            };
          }

          // update gender count
          if (gender === 'male') {
            acc[company.department].male += 1;
          } else if (gender === 'female') {
            acc[company.department].female += 1;
          }

          // update age range and mode
          if (!acc[company.department].ageRange) {
            acc[company.department].ageRange = `${age}-${age}`;
            acc[company.department].ageMode = age;
          } else {
            const [minAge, maxAge] = acc[company.department].ageRange.split('-').map(Number);
            if (age < minAge) {
              acc[company.department].ageRange = `${age}-${maxAge}`;
            } else if (age > maxAge) {
              acc[company.department].ageRange = `${minAge}-${age}`;
            }

            const ageCounts: { [age: number]: number } = {};
            for (let i = minAge; i <= maxAge; i++) {
              ageCounts[i] = 0;
            }
            ageCounts[minAge] = 1;
            ageCounts[maxAge] = 1;
            for (const user of Object.values(acc[company.department].addressUser)) {
              const userAge = response.data.users.find((u: any) => `${u.firstName}${u.lastName}` === user)?.age;
              if (userAge) {
                ageCounts[userAge] += 1;
              }
            }
            let maxCount = 0;
            let mode = 0;
            for (const [key, value] of Object.entries(ageCounts)) {
              if (value > maxCount) {
                maxCount = value;
                mode = Number(key);
              }
            }
            acc[company.department].ageMode = mode;
          }

          // update hair color count
          if (acc[company.department].hair[hair.color]) {
            acc[company.department].hair[hair.color] += 1;
          } else {
            acc[company.department].hair[hair.color] = 1;
          }

          // update user address
          acc[company.department].addressUser[`${firstName}${lastName}`] = address.postalCode;
          return acc;
        }, {});
        console.log(grouped)
        setGroupedData(grouped);
      })
      .catch(error => console.error(error));
  }, []);
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
