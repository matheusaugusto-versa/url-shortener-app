'use client';

import { styles } from './constants';

function TableHeader() {
  const headers = ['Short URL', 'Long URL', 'Clicks', 'Created', 'Actions'];

  return (
    <thead>
      <tr className="border-b border-neutral-200 dark:border-neutral-700">
        {headers.map((header) => (
          <th key={header} className={styles.headerCell}>
            {header}
          </th>
        ))}
      </tr>
    </thead>
  );
}

export { TableHeader };
