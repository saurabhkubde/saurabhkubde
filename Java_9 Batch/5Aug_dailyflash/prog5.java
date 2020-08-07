class Table {
	public static void main(String[] args) {
		int num = 3,ans;

		System.out.println("Table of 3 :");
		for(int i=1;i<=10;i++) 
			System.out.println(3*i);

		System.out.println("Even numbers present in table");
		for(int i=1;i<=10;i++){
			ans = 3 * i;
			if(ans % 2 == 0)
			System.out.println(ans);

		}

	}//main

}//end class



