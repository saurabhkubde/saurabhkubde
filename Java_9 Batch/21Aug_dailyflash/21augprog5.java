import java.io.*;

class ascii {
	public static void main(String[] args) throws IOException {
		InputStreamReader isr = new InputStreamReader(System.in);
		BufferedReader br = new BufferedReader(isr); 

		int value = br.read();
		
		System.out.println(value);


		}

}	
		

